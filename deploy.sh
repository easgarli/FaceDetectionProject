#!/bin/bash

echo "Stopping and removing existing containers and pod..."
podman pod stop face-recognition-app 2>/dev/null
podman pod rm face-recognition-app 2>/dev/null

echo "Creating new pod..."
podman pod create --name face-recognition-app -p 5000:5000 -p 3000:80

echo "Building and running backend..."
cd backend
podman build -t face-recognition-backend -f Containerfile .
podman run -d --pod face-recognition-app \
    --name backend \
    -v ./static/uploaded_photos:/app/static/uploaded_photos:Z \
    -v ./instance:/app/instance:Z \
    face-recognition-backend

echo "Building and running frontend..."
cd ../frontend
podman build -t face-recognition-frontend -f Containerfile .
podman run -d --pod face-recognition-app \
    --name frontend \
    face-recognition-frontend

echo "Deployment complete!"
echo "Frontend available at: http://localhost:3000"
echo "Backend available at: http://localhost:5000" 