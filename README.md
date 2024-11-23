# Face Recognition App

A web application for face detection and recognition with label management capabilities.

## Overview

This application consists of:
- Frontend: React-based UI for photo upload and management
- Backend: Flask server handling face detection and recognition
- Face Recognition: Using FaceNet and pre-trained models

## Prerequisites

- Docker and Docker Compose
- Python 3.9+
- Node.js 16+
- Pre-trained face recognition model (`.pkl` file)

## Project Structure

```
face-recognition-app/
├── backend/
│   ├── static/
│   │   └── uploaded_photos/
│   ├── instance/
│   ├── embeddings/
│   │   └── face_recognition_model.pkl
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### 1. Model Preparation

Before running the application, you need to:
1. Fine-tune the face recognition model using FaceNet
2. Generate embeddings for your face dataset
3. Save the model as `face_recognition_model.pkl`
4. Place the model file in `backend/embeddings/` directory

### 2. Backend Setup

```bash
cd backend

# Create necessary directories
mkdir -p static/uploaded_photos instance embeddings

# Install dependencies
pip install -r requirements.txt

# Place your face_recognition_model.pkl in embeddings/
# Make sure the model file is named: face_recognition_model.pkl
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 4. Docker Setup

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Accessing the Application

- Frontend: http://localhost
- Backend API: http://localhost:5000

## Features

- Face Detection: Upload photos and detect faces
- Face Recognition: Identify people in photos
- Label Management: Edit and update person labels
- Photo Gallery: View and manage uploaded photos
- Explore View: Filter photos by person

## API Endpoints

- `POST /upload`: Upload photos
- `GET /photos`: Get all photos
- `GET /labels`: Get all person labels
- `POST /update-label`: Update person labels

## Development

For local development:
1. Ensure Docker is running
2. Use `docker-compose up` to start services
3. Frontend code changes will auto-reload
4. Backend changes require service restart

## Production Deployment

For production:
1. Update `VITE_API_URL` in frontend/.env to your server IP
2. Configure SSL/TLS
3. Set up proper CORS rules
4. Enable production mode in Flask
5. Configure proper security measures

## Notes

- The application requires a pre-trained face recognition model
- Model file must be named `face_recognition_model.pkl`
- Photos are stored in `backend/static/uploaded_photos/`
- Database is stored in `backend/instance/`

## Troubleshooting

Common issues:
1. Model file not found: Ensure `face_recognition_model.pkl` is in correct location
2. Upload errors: Check folder permissions
3. Connection issues: Verify API URL in frontend .env file

## License

MIT

## Contributors

Elnur Asgarli