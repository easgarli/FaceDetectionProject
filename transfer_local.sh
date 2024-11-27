#!/bin/bash

# Remote server details
REMOTE_IP="192.168.0.24"
REMOTE_USER="administrator"
PROJECT_DIR="face-recognition-app"

# Create project directory on remote
# ssh ${REMOTE_USER}@${REMOTE_IP} "mkdir -p ~/${PROJECT_DIR}"

# Transfer files with exclusions
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '__pycache__' \
    --exclude 'dist' \
    --exclude 'facenv' \
    --exclude '*.pyc' \
    frontend/Containerfile ${REMOTE_USER}@${REMOTE_IP}:~/${PROJECT_DIR}/frontend/Containerfile

echo "Files transferred successfully!" 