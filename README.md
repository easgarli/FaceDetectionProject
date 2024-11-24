# Face Recognition System

A deep learning-based face recognition system with web interface for photo management and label control.

## Presentation is available at 
https://docs.google.com/presentation/d/11goJALVAzFKwUOgDDz5O3_1OvpuqU9Wsu3-GoWeNxQs/edit?usp=sharing

## Features
- Face detection using MTCNN
- Face recognition using FaceNet embeddings
- KNN classification for face matching
- Real-time processing
- Label management system
- Web-based user interface

## Technical Stack
- **Backend**: Flask, PyTorch, FaceNet
- **Frontend**: React, Vite
- **Database**: SQLite
- **Containerization**: Podman

## Prerequisites
- Python 3.9+
- Node.js 16+
- Podman
- Pre-trained face recognition model (PKL file)

## Project Structure
```
face-recognition-app/
├── backend/
│   ├── embeddings/
│   │   └── face_recognition_model.pkl
│   ├── instance/
│   ├── static/
│   │   └── uploaded_photos/
│   ├── app.py
│   ├── requirements.txt
│   └── Containerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── nginx.conf
│   └── Containerfile
└── README.md
```

## Model Details
The system uses:
- MTCNN for face detection
- FaceNet (InceptionResNetV1) for feature extraction
- KNN classifier for face recognition
- Pre-trained on VGGFace2 dataset

## Deployment Instructions

### Local Development
1. Clone repository:
```bash
git clone <repository-url>
cd face-recognition-app
```

2. Backend setup:
```bash
cd backend
python -m venv facenv
source facenv/bin/activate  # or `facenv\Scripts\activate` on Windows
pip install -r requirements.txt
python app.py
```

3. Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

### Podman Deployment

1. Build Images:
```bash
# Backend
cd backend
podman build -t face-recognition-backend .

# Frontend
cd frontend
podman build -t face-recognition-frontend .
```

2. Create Pod and Run Containers:
```bash
# Create pod
podman pod create --name face-recognition-app -p 5000:5000 -p 3000:80

# Run backend
podman run -d --pod face-recognition-app \
    --name backend \
    -v ./backend/static/uploaded_photos:/app/static/uploaded_photos:Z \
    -v ./backend/instance:/app/instance:Z \
    -v ./backend/embeddings:/app/embeddings:Z \
    face-recognition-backend

# Run frontend
podman run -d --pod face-recognition-app \
    --name frontend \
    face-recognition-frontend
```

3. Check Status:
```bash
podman pod ps
podman logs backend
podman logs frontend
```

### Remote Deployment

1. Transfer files:
```bash
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '__pycache__' \
    --exclude 'dist' \
    --exclude 'facenv' \
    --exclude '*.pyc' \
    ./ user@remote-ip:~/face-recognition-app/
```

2. SSH and deploy:
```bash
ssh user@remote-ip
cd face-recognition-app
# Follow Podman deployment steps above
```

## API Endpoints
- `POST /upload`: Upload photos
- `GET /photos`: List all photos
- `POST /detect`: Detect faces
- `PUT /label`: Update labels

## Environment Variables
Backend:
```env
FLASK_ENV=development
FLASK_APP=app.py
```

Frontend:
```env
VITE_API_URL=http://localhost:5000
```

## Performance
Classification Report:
```
              precision  recall  f1-score  support
fidan           0.78     0.80     0.79      59
leyla           0.72     0.90     0.80      58
others          0.58     0.26     0.36      27
```

## Troubleshooting
Common issues:
1. Port conflicts: Change ports in pod creation
2. Permission issues: Add :Z to volume mounts
3. Model not found: Check embeddings directory
4. Container fails: Check logs with `podman logs`

## Contributing
MIT License

## License
Elnur Asgarli