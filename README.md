# Face Detection and Recognition Web Application

# The Project is still under development!!!

A Google Photos-like web application that allows users to upload photos, detect faces, predict labels, and filter photos by detected individuals.

## Features

- Upload multiple photos
- Automatic face detection using MTCNN
- Face recognition and label prediction using Facenet and k-NN
- Filter photos by detected individuals
- Web-based user interface

## Tech Stack

### Backend
- Flask (Python web framework)
- facenet-pytorch (Face detection and embedding extraction)
- scikit-learn (Label prediction)
- SQLite (Database)

### Frontend
- HTML/CSS
- Bootstrap (coming soon)

## Installation

1. Clone the repository

bash
git clone https://github.com/yourusername/face-detection-project.git
cd face-detection-project

2. Create and activate virtual environment

bash
python -m venv facenv
source facenv/bin/activate  # On Windows use: facenv\Scripts\activate

3. Install required packages

bash
pip install -r requirements.txt

## Project Structure
```
face-detection-project/
├── app.py              # Main Flask application
├── photos.db           # SQLite database
├── templates/          # HTML templates
│   └── index.html      # Homepage template
├── uploaded_photos/    # Directory for uploaded photos
├── embeddings/         # Directory for face embeddings
├── requirements.txt    # Python dependencies
└── README.md
```

## Usage

1. Start the Flask server:

bash
python app.py

2. Open your web browser and navigate to:

bash
http://localhost:5000

3. Use the upload button to select and upload photos
4. View detected faces and labels
5. Filter photos by selecting specific labels

## Database Schema

The application uses SQLite database (`photos.db`) with the following schema:

**photos table:**
- id (INTEGER): Primary key
- file_path (TEXT): Path to the stored photo
- labels (TEXT): Comma-separated list of detected face labels

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [facenet-pytorch](https://github.com/timesler/facenet-pytorch) for face detection
- [scikit-learn](https://scikit-learn.org/) for machine learning functionality

## Contact

Your Name - your.email@example.com

Project Link: https://github.com/easgarli/FaceDetectionProject


