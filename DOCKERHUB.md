# Face Recognition App Docker Hub Migration Guide

This guide describes how to migrate the face recognition application using Docker Hub.

## Prerequisites
- Docker Hub account
- Podman installed on both servers
- SSH access to both servers
- Internet access on both servers

## 1. Prepare Current Server

### 1.1 Login to Docker Hub
```bash
# Login to Docker Hub
podman login docker.io
# Enter your Docker Hub username and password when prompted
```

### 1.2 Tag Images
```bash
# Tag your images with your Docker Hub username
podman tag face-recognition-backend docker.io/yourusername/face-recognition-backend:latest
podman tag face-recognition-frontend docker.io/yourusername/face-recognition-frontend:latest

# Verify tags
podman images
```

### 1.3 Push Images to Docker Hub
```bash
# Push both images
podman push docker.io/yourusername/face-recognition-backend:latest
podman push docker.io/yourusername/face-recognition-frontend:latest
```

### 1.4 Prepare Data Volumes
```bash
# Verify data directories
ls -la ~/face-app-data/uploaded_photos
ls -la ~/face-app-data/instance
ls -la ~/face-app-data/embeddings
```

## 2. Transfer Data to New Server

### 2.1 Transfer Data Volumes
```bash
# Create directory on new server
ssh user@new-server "mkdir -p ~/face-app-data"

# Transfer data volumes
rsync -avz ~/face-app-data/ user@new-server:~/face-app-data/
```

## 3. Deploy on New Server

### 3.1 Login and Pull Images
```bash
# SSH into new server
ssh user@new-server

# Login to Docker Hub
podman login docker.io

# Pull images
podman pull docker.io/yourusername/face-recognition-backend:latest
podman pull docker.io/yourusername/face-recognition-frontend:latest

# Verify images
podman images
```

### 3.2 Create Pod and Run Containers
```bash
# Create pod
podman pod create --name face-recognition-app -p 5000:5000 -p 3000:80

# Run backend container
podman run -d --pod face-recognition-app \
    --name backend \
    -v ~/face-app-data/uploaded_photos:/app/static/uploaded_photos:Z \
    -v ~/face-app-data/instance:/app/instance:Z \
    -v ~/face-app-data/embeddings:/app/embeddings:Z \
    docker.io/yourusername/face-recognition-backend:latest

# Run frontend container
podman run -d --pod face-recognition-app \
    --name frontend \
    docker.io/yourusername/face-recognition-frontend:latest
```

### 3.3 Verify Deployment
```bash
# Check pod status
podman pod ps

# Check container status
podman ps

# Check container logs
podman logs backend
podman logs frontend
```

## 4. Post-Migration Tasks

### 4.1 Verify Application
- Access frontend at `http://new-server-ip:3000`
- Test photo upload functionality
- Verify face detection works
- Check if existing photos are accessible

### 4.2 Logout from Docker Hub (Optional)
```bash
# Logout from Docker Hub on both servers
podman logout docker.io
```

## Troubleshooting

### Common Issues
1. Docker Hub Authentication
   ```bash
   # Re-login to Docker Hub
   podman login docker.io
   ```

2. Permission Errors
   ```bash
   # Fix permissions on data directories
   chmod -R 755 ~/face-app-data
   ```

3. Network Issues
   ```bash
   # Check if ports are open
   ss -tulpn | grep -E '3000|5000'
   
   # Configure firewall if needed
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --add-port=5000/tcp --permanent
   sudo firewall-cmd --reload
   ```

## Security Notes
- Use private repositories for sensitive code
- Regularly rotate Docker Hub credentials
- Remove unused images and containers
- Keep your Podman and container images updated

## Directory Structure
After migration, your new server should have this structure:
```
/home/username/
├── face-app-data/
│   ├── uploaded_photos/
│   ├── instance/
│   └── embeddings/
```

## Backup Recommendation
Keep regular backups of the `face-app-data` directory, as it contains all user data and model files.
