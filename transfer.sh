#!/bin/bash

# Remote server details
REMOTE_IP="74.207.235.22"
REMOTE_USER="root"
PROJECT_DIR="face-recognition-app"

# Create project directory on remote
ssh ${REMOTE_USER}@${REMOTE_IP} "mkdir -p ~/${PROJECT_DIR}"

# Transfer files with additional exclusions
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '__pycache__' \
    --exclude 'dist' \
    --exclude 'facenv' \
    --exclude '*.pyc' \
    ./ ${REMOTE_USER}@${REMOTE_IP}:~/${PROJECT_DIR}/

echo "Files transferred successfully!" 