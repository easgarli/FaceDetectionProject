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
        # Photos table
        conn.execute("""
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY,
            file_path TEXT NOT NULL,
            thumbnail_path TEXT NOT NULL,
            labels TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Label mappings table to track label changes
        conn.execute("""
        CREATE TABLE IF NOT EXISTS label_mappings (
            id INTEGER PRIMARY KEY,
            original_label TEXT NOT NULL,
            current_label TEXT NOT NULL,
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

def normalize_label(label, existing_labels):
    """Match a label with existing labels case-insensitively and partially"""
    if not label:
        return label
    
    print(f"Normalizing label: {label}")
    print(f"Existing labels: {existing_labels}")
    
    # Convert to lowercase for comparison
    label_lower = label.lower().strip()
    
    # First try exact match
    for existing_label in existing_labels:
        if existing_label.lower().strip() == label_lower:
            print(f"Exact match found! Returning: {existing_label}")
            return existing_label
    
    # Then try partial match
    for existing_label in existing_labels:
        if label_lower in existing_label.lower() or existing_label.lower() in label_lower:
            print(f"Partial match found! Returning: {existing_label}")
            return existing_label
    
    print(f"No match found. Returning original: {label}")
    return label

def get_all_existing_labels():
    """Fetch all existing labels from the database"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT labels FROM photos WHERE labels != ''")
        rows = cursor.fetchall()
        
        # Create a set of all unique labels
        all_labels = set()
        for row in rows:
            if row[0]:  # if labels exist
                # Split the comma-separated labels and add each one
                labels = row[0].split(',')
                all_labels.update(label.strip() for label in labels if label.strip())
        
        print("All existing labels:", all_labels)  # Debug log
        return all_labels

def get_current_label(original_label):
    """Get the most recent mapping for a label"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT current_label 
            FROM label_mappings 
            WHERE original_label = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        """, (original_label,))
        result = cursor.fetchone()
        return result[0] if result else original_label

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
                
                print(f"Processing file: {filepath}")
                file.save(filepath)
                
                # Create thumbnail
                thumb_name = create_thumbnail(filepath)
                
                # Detect faces and get labels
                img = Image.open(filepath)
                faces = mtcnn(img)
                if faces is not None:
                    face_embeddings = resnet(faces).detach().cpu()
                    predictions = knn.predict(face_embeddings)
                    
                    # Get current versions of predicted labels
                    current_labels = [get_current_label(pred) for pred in predictions]
                    labels = ",".join(set(current_labels))
                else:
                    labels = ""
                
                print(f"Final labels for file: {labels}")
                
                cursor.execute("""
                    INSERT INTO photos (file_path, thumbnail_path, labels)
                    VALUES (?, ?, ?)
                """, (filename, thumb_name, labels))
                
                results.append({
                    'filename': filename,
                    'thumbnail': thumb_name,
                    'labels': labels.split(',') if labels else [],
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
            SELECT file_path, thumbnail_path, labels, timestamp 
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
                    "labels": row[2].split(",") if row[2] else [],
                    "timestamp": row[3]
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

@app.route('/labels', methods=['GET'])
def get_all_labels():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT labels FROM photos WHERE labels != ''")
        all_labels = cursor.fetchall()
        
        # Process labels
        unique_labels = set()
        for row in all_labels:
            if row[0]:  # if labels exist
                labels = row[0].split(',')
                unique_labels.update(label.strip() for label in labels if label.strip())
        
        return jsonify({
            "labels": sorted(list(unique_labels))
        })

@app.route('/update-label', methods=['POST'])
def update_label():
    data = request.json
    old_label = data.get('oldLabel')
    new_label = data.get('newLabel')
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Add new mapping
        cursor.execute("""
            INSERT INTO label_mappings (original_label, current_label)
            VALUES (?, ?)
        """, (old_label, new_label))
        
        # Update all photos that have the old label
        cursor.execute("""
            UPDATE photos 
            SET labels = REPLACE(labels, ?, ?)
            WHERE labels LIKE ?
        """, (old_label, new_label, f'%{old_label}%'))
        
        conn.commit()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    print(f"Starting server... (using {device})")
    app.run(debug=True, host='0.0.0.0', port=5000)
