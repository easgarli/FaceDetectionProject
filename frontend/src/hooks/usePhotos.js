import { useState, useCallback, useEffect } from 'react';
import { photoAPI, labelAPI } from '../api';
import { usePhotoContext } from '../context/PhotoContext';

export const usePhotos = () => {
    const {
        photos,
        labels,
        selectedPhoto,
        selectedLabel,
        loading,
        error,
        setSelectedPhoto
    } = usePhotoContext();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'fullscreen'

    // Navigation handlers
    const goToNextPhoto = useCallback(() => {
        if (currentIndex < photos.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedPhoto(photos[currentIndex + 1]);
        }
    }, [currentIndex, photos, setSelectedPhoto]);

    const goToPreviousPhoto = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setSelectedPhoto(photos[currentIndex - 1]);
        }
    }, [currentIndex, photos, setSelectedPhoto]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (viewMode === 'fullscreen') {
                switch (e.key) {
                    case 'ArrowRight':
                        goToNextPhoto();
                        break;
                    case 'ArrowLeft':
                        goToPreviousPhoto();
                        break;
                    case 'Escape':
                        setViewMode('grid');
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [viewMode, goToNextPhoto, goToPreviousPhoto]);

    // File upload handler
    const handleFileUpload = useCallback(async (files) => {
        try {
            setUploadProgress(0);
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('photos', file);
            });

            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            });

            const response = await new Promise((resolve, reject) => {
                xhr.open('POST', `${import.meta.env.VITE_API_URL}/upload`);
                
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.send(formData);
            });

            setUploadProgress(100);
            return response;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }, []);

    // Photo filtering and sorting
    const getFilteredPhotos = useCallback((filterLabel = selectedLabel) => {
        if (!filterLabel) return photos;
        return photos.filter(photo => 
            photo.labels && photo.labels.includes(filterLabel)
        );
    }, [photos, selectedLabel]);

    const sortPhotosByDate = useCallback((photosList = photos) => {
        return [...photosList].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }, [photos]);

    // Photo selection handlers
    const handlePhotoClick = useCallback((photo) => {
        setSelectedPhoto(photo);
        setViewMode('fullscreen');
        setCurrentIndex(photos.findIndex(p => p.id === photo.id));
    }, [photos, setSelectedPhoto]);

    const handleCloseFullscreen = useCallback(() => {
        setViewMode('grid');
        setSelectedPhoto(null);
    }, [setSelectedPhoto]);

    // Photo deletion handler (if implemented in backend)
    const handlePhotoDelete = useCallback(async (photoId) => {
        try {
            await photoAPI.deletePhoto(photoId);
            // Update context/state after successful deletion
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }, []);

    return {
        // State
        photos,
        labels,
        selectedPhoto,
        selectedLabel,
        loading,
        error,
        currentIndex,
        uploadProgress,
        viewMode,

        // Photo operations
        handleFileUpload,
        handlePhotoClick,
        handlePhotoDelete,
        handleCloseFullscreen,
        
        // Navigation
        goToNextPhoto,
        goToPreviousPhoto,
        
        // Filtering and sorting
        getFilteredPhotos,
        sortPhotosByDate,
        
        // View mode
        setViewMode
    };
};

// Usage example:
/*
import { usePhotos } from '../hooks/usePhotos';

function PhotoGrid() {
    const {
        photos,
        loading,
        error,
        handlePhotoClick,
        handleFileUpload,
        uploadProgress,
        getFilteredPhotos
    } = usePhotos();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const filteredPhotos = getFilteredPhotos();

    return (
        <div className="photo-grid">
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                    Uploading: {uploadProgress}%
                </div>
            )}

            <div className="photos-container">
                {filteredPhotos.map(photo => (
                    <div
                        key={photo.id}
                        className="photo-item"
                        onClick={() => handlePhotoClick(photo)}
                    >
                        <img src={photo.url} alt="" />
                    </div>
                ))}
            </div>
        </div>
    );
}
*/
