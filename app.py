from flask import Flask, request, jsonify, render_template
import os
from werkzeug.utils import secure_filename
from facenet_pytorch import MTCNN, InceptionResnetV1
from torchvision import transforms
import torch
import pickle
import sqlite3
from PIL import Image

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploaded_photos'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load trained model
model_path = './embeddings/face_recognition_model.pkl'
with open(model_path, 'rb') as f:
    knn = pickle.load(f)

# Initialize face detection and embedding model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# SQLite database setup
db_path = './photos.db'
conn = sqlite3.connect(db_path, check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY,
    file_path TEXT NOT NULL,
    labels TEXT NOT NULL
)
""")
conn.commit()

# Route: Upload and analyze multi-person photos
@app.route('/upload', methods=['POST'])
def upload_photos():
    uploaded_files = request.files.getlist('photos')
    results = []

    valid_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
    
    for file in uploaded_files:
        filename = secure_filename(file.filename)
        if not filename.lower().endswith(valid_extensions):
            print(f"Skipping invalid file: {filename}")
            continue
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            # Open image
            img = Image.open(file_path)
            
            # Ensure RGB mode
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # Detect all faces in the image with confidence scores
            boxes, probs = mtcnn.detect(img)
            if boxes is not None:
                labels = []
                for i, (box, prob) in enumerate(zip(boxes, probs)):
                    if prob < 0.88:  # Confidence threshold
                        print(f"Skipping low-confidence face in {filename} (confidence: {prob:.2f})")
                        continue
                    
                    # Extract face region
                    x1, y1, x2, y2 = map(int, box)
                    face = img.crop((x1, y1, x2, y2)).resize((160, 160))  # Align and resize
                    
                    # Convert the face to a tensor
                    face_tensor = transforms.ToTensor()(face).unsqueeze(0).to(device)
                    embedding = resnet(face_tensor).detach().cpu().numpy().flatten()

                    # Predict label
                    prediction = knn.predict([embedding])[0]
                    labels.append(prediction)

                    print(f"Photo: {filename}, Face {i + 1}: Predicted as {prediction}")

                # Save results in database
                cursor.execute("INSERT INTO photos (file_path, labels) VALUES (?, ?)", (file_path, ",".join(labels)))
                conn.commit()
                results.append({"file": filename, "labels": labels})
            else:
                print(f"No faces detected in {filename}")
                results.append({"file": filename, "labels": []})

        except Exception as e:
            print(f"Error processing {filename}: {e}")
            results.append({"file": filename, "error": str(e)})

    return jsonify(results)

# Route: List labels
@app.route('/labels', methods=['GET'])
def list_labels():
    cursor.execute("SELECT DISTINCT labels FROM photos")
    all_labels = cursor.fetchall()
    unique_labels = {label for row in all_labels for label in row[0].split(",")}
    return jsonify(sorted(unique_labels))

# Route: Get photos by label
@app.route('/photos/<label>', methods=['GET'])
def get_photos_by_label(label):
    cursor.execute("SELECT file_path FROM photos WHERE labels LIKE ?", (f"%{label}%",))
    photos = cursor.fetchall()
    return jsonify([row[0] for row in photos])

# Route: Homepage
@app.route('/')
def home():
    return render_template('index.html')

# Route: Favicon
@app.route('/favicon.ico')
def favicon():
    return '', 204  # or serve a static file

# Run app
if __name__ == '__main__':
    app.run(debug=True)
