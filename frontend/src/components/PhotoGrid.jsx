import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // You'll need to install framer-motion
import { photoAPI } from '../api';

function PhotoGrid() {
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedPhoto) return;
            
            switch(e.key) {
                case 'Escape':
                    setSelectedPhoto(null);
                    setScale(1);
                    break;
                case 'ArrowLeft':
                    navigatePhotos('prev');
                    break;
                case 'ArrowRight':
                    navigatePhotos('next');
                    break;
                case '+':
                    setScale(prev => Math.min(prev + 0.2, 3));
                    break;
                case '-':
                    setScale(prev => Math.max(prev - 0.2, 0.5));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhoto, photos]);

    // Slideshow functionality
    useEffect(() => {
        let interval;
        if (isPlaying && selectedPhoto) {
            interval = setInterval(() => {
                navigatePhotos('next');
            }, 3000); // Change slide every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isPlaying, selectedPhoto]);

    const navigatePhotos = (direction) => {
        const currentIndex = photos.findIndex(p => p.path === selectedPhoto.path);
        let newIndex;
        
        if (direction === 'next') {
            newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
        } else {
            newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
        }
        
        setSelectedPhoto(photos[newIndex]);
        setSelectedIndex(newIndex);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const downloadImage = async (photo) => {
        const response = await fetch(`${API_URL}/static/uploaded_photos/${photo.path}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = photo.path;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const fetchPhotos = async () => {
        try {
            const response = await photoAPI.getAllPhotos();
            console.log('Photos data:', response.photos);
            setPhotos(response.photos || []);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {photos.map((photo, index) => (
                    <div 
                        key={index}
                        style={{
                            width: '100%',
                            height: '200px',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        <img
                            src={`${API_URL}/static/uploaded_photos/${photo.thumbnail}`}
                            alt={`Photo ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '0.5rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                {photo.labels.join(', ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal/Overlay for full-size image */}
            {selectedPhoto && (
                <AnimatePresence>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => {
                            setSelectedPhoto(null);
                            setScale(1);
                            setIsPlaying(false);
                        }}
                    >
                        <div 
                            className="relative max-w-[90vw] max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.img
                                src={`${API_URL}/static/uploaded_photos/${selectedPhoto.path}`}
                                alt="Full size"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '90vh',
                                    transform: `scale(${scale})`,
                                    transition: 'transform 0.2s',
                                    cursor: 'zoom-in'
                                }}
                            />

                            {/* Controls overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <button 
                                            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                                            className="mr-2 px-3 py-1 bg-gray-700 rounded"
                                        >
                                            -
                                        </button>
                                        <button 
                                            onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
                                            className="mr-2 px-3 py-1 bg-gray-700 rounded"
                                        >
                                            +
                                        </button>
                                        <button 
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="mr-2 px-3 py-1 bg-gray-700 rounded"
                                        >
                                            {isPlaying ? '⏸' : '▶'}
                                        </button>
                                        <button 
                                            onClick={() => downloadImage(selectedPhoto)}
                                            className="px-3 py-1 bg-gray-700 rounded"
                                        >
                                            ⬇
                                        </button>
                                    </div>
                                    <div className="text-sm">
                                        {selectedPhoto.labels.join(', ')}
                                        <br />
                                        {formatDate(selectedPhoto.timestamp)}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation arrows */}
                            <button
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigatePhotos('prev');
                                }}
                            >
                                ←
                            </button>
                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigatePhotos('next');
                                }}
                            >
                                →
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}

export default PhotoGrid;