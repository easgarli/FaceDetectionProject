from dotenv import load_dotenv
import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import pickle
from PIL import Image

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure paths and settings
UPLOAD_FOLDER = os.path.join('static', 'uploaded_photos')
DATABASE_PATH = os.path.join('instance', 'photos.db')
MODEL_PATH = './embeddings/face_recognition_model.pkl'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Initialize ML models
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load trained model
with open(MODEL_PATH, 'rb') as f:
    knn = pickle.load(f)

# Add this near the top with other configurations
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db():
    """Database connection factory"""
    if not hasattr(get_db, 'db'):
        # Ensure instance directory exists
        os.makedirs('instance', exist_ok=True)
        get_db.db = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    return get_db.db

def init_db():
    """Initialize database schema"""
    with get_db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY,
            file_path TEXT NOT NULL,
            thumbnail_path TEXT NOT NULL,
            labels TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()

def ensure_directories():
    """Ensure all required directories exist"""
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs('instance', exist_ok=True)

# Initialize app
ensure_directories()
init_db()

def create_thumbnail(image_path, size=(300, 200)):
    """Create a thumbnail version of the uploaded image"""
    thumbnail_name = f"thumb_{os.path.basename(image_path)}"
    thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
    
    with Image.open(image_path) as img:
        # Convert to RGB if needed
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Calculate dimensions maintaining aspect ratio
        img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Create new image with exact dimensions
        thumb = Image.new('RGB', size, (255, 255, 255))
        
        # Paste resized image centered
        offset = ((size[0] - img.size[0]) // 2,
                 (size[1] - img.size[1]) // 2)
        thumb.paste(img, offset)
        
        # Save thumbnail
        thumb.save(thumbnail_path, 'JPEG', quality=85)
        
    return thumbnail_name

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'photos' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    files = request.files.getlist('photos')
    results = []
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        for file in files:
            if file.filename == '':
                continue
                
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                
                print(f"Saving file to: {filepath}")
                file.save(filepath)
                
                # Create thumbnail
                thumb_name = create_thumbnail(filepath)
                
                # Store both paths in database
                cursor.execute("""
                    INSERT INTO photos (file_path, thumbnail_path, labels)
                    VALUES (?, ?, ?)
                """, (filename, thumb_name, ""))
                
                results.append({
                    'filename': filename,
                    'thumbnail': thumb_name,
                    'status': 'success'
                })
        
        conn.commit()
    
    return jsonify(results)

@app.route('/photos', methods=['GET'])
def get_all_photos():
    existing_files = set(os.listdir(UPLOAD_FOLDER))
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT file_path, thumbnail_path, labels 
            FROM photos 
            ORDER BY id DESC
        """)
        photos = cursor.fetchall()
        
        valid_photos = []
        for row in photos:
            filename = os.path.basename(row[0])
            thumb_name = row[1]
            if filename in existing_files and thumb_name in existing_files:
                valid_photos.append({
                    "path": filename,
                    "thumbnail": thumb_name,
                    "labels": row[2].split(",") if row[2] else []
                })
    
    return jsonify({
        "photos": valid_photos,
        "count": len(valid_photos)
    })

@app.route('/static/uploaded_photos/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/debug/config')
def debug_config():
    return jsonify({
        'upload_folder': UPLOAD_FOLDER,
        'database_path': DATABASE_PATH,
        'upload_folder_exists': os.path.exists(UPLOAD_FOLDER),
        'database_exists': os.path.exists(DATABASE_PATH),
        'current_working_dir': os.getcwd(),
        'upload_contents': os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else []
    })

@app.route('/debug/database')
def debug_database():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT file_path, labels FROM photos")
        photos = cursor.fetchall()
        return jsonify({
            "database_entries": [{
                "file_path": row[0],
                "labels": row[1]
            } for row in photos]
        })

@app.route('/debug/files')
def debug_files():
    """Debug endpoint to check file system status"""
    return jsonify({
        "files": os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else [],
        "full_paths": [
            os.path.join(UPLOAD_FOLDER, f) 
            for f in os.listdir(UPLOAD_FOLDER)
        ] if os.path.exists(UPLOAD_FOLDER) else [],
        "upload_dir": UPLOAD_FOLDER
    })

if __name__ == '__main__':
    print(f"Starting server... (using {device})")
    app.run(debug=True, host='0.0.0.0', port=5000)
