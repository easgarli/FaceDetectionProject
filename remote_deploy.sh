#!/bin/bash

# Remote server details
REMOTE_IP="74.207.235.22"
REMOTE_USER="root"
DOCKER_USERNAME="elnurak"  # Your Docker Hub username

# SSH into remote server and run deployment commands
ssh ${REMOTE_USER}@${REMOTE_IP} "
    # Login to Docker Hub
    podman login docker.io

    # Stop and remove existing containers and pod
    podman pod stop face-recognition-app 2>/dev/null
    podman pod rm face-recognition-app 2>/dev/null

    # Create new pod
    podman pod create --name face-recognition-app -p 5000:5000 -p 3000:80

    # Pull latest images
    podman pull docker.io/${DOCKER_USERNAME}/face-recognition-backend:latest
    podman pull docker.io/${DOCKER_USERNAME}/face-recognition-frontend:latest

    # Run containers
    podman run -d --pod face-recognition-app \
        --name backend \
        -v ./static/uploaded_photos:/app/static/uploaded_photos:Z \
        -v ./instance:/app/instance:Z \
        docker.io/${DOCKER_USERNAME}/face-recognition-backend:latest

    podman run -d --pod face-recognition-app \
        --name frontend \
        docker.io/${DOCKER_USERNAME}/face-recognition-frontend:latest

    # Check pod status
    podman pod ps
    
    # Check container logs
    echo 'Backend logs:'
    podman logs backend
    echo 'Frontend logs:'
    podman logs frontend
"

echo "Deployment complete!"
echo "Frontend available at: http://${REMOTE_IP}:3000"
echo "Backend available at: http://${REMOTE_IP}:5000" 