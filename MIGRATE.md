# Face Recognition App Migration Guide

This guide describes how to migrate the face recognition application to a new server.

## Prerequisites
- Podman installed on both servers
- SSH access to both servers
- Sufficient disk space on both servers

## 1. Prepare Current Server

### 1.1 Save Container Images
```bash
# Create transfer directory
mkdir ~/face-app-transfer

# Save images to tar files
podman save face-recognition-backend > ~/face-app-transfer/backend-image.tar
podman save face-recognition-frontend > ~/face-app-transfer/frontend-image.tar
```

### 1.2 Verify Data Volumes
```bash
# Check data directories
ls -la ~/face-app-data/uploaded_photos
ls -la ~/face-app-data/instance
ls -la ~/face-app-data/embeddings
```

## 2. Transfer Files to New Server

### 2.1 Transfer Images and Data
```bash
# Create directories on new server
ssh user@new-server "mkdir -p ~/face-app-transfer ~/face-app-data"

# Transfer container images
rsync -avz ~/face-app-transfer/ user@new-server:~/face-app-transfer/

# Transfer data volumes
rsync -avz ~/face-app-data/ user@new-server:~/face-app-data/
```

## 3. Deploy on New Server

### 3.1 Load Container Images
```bash
# SSH into new server
ssh user@new-server

# Load images from tar files
podman load < ~/face-app-transfer/backend-image.tar
podman load < ~/face-app-transfer/frontend-image.tar

# Verify images are loaded
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
    face-recognition-backend

# Run frontend container
podman run -d --pod face-recognition-app \
    --name frontend \
    face-recognition-frontend
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

### 4.2 Clean Up Transfer Files
```bash
# Remove transfer directory on new server
rm -rf ~/face-app-transfer

# Remove transfer directory on old server
rm -rf ~/face-app-transfer
```

## Troubleshooting

### Common Issues
1. Permission Errors
   ```bash
   # Fix permissions on data directories
   chmod -R 755 ~/face-app-data
   ```

2. Container Start Failures
   ```bash
   # Check detailed container logs
   podman logs backend
   podman logs frontend
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
