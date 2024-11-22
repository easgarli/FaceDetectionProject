import { useState, useEffect } from 'react';
import { photoAPI } from '../api';

function PhotoGrid() {
    const [photos, setPhotos] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await photoAPI.getAllPhotos();
                console.log('Photos response:', response);
                setPhotos(response.photos || []);
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchPhotos();
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {photos.map((photo, index) => {
                const imageUrl = `${API_URL}/static/uploaded_photos/${photo.path}`;
                
                return (
                    <div key={index} className="relative group">
                        <img
                            src={imageUrl}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                            style={{
                                maxHeight: '300px',
                                width: '100%'
                            }}
                            onError={(e) => {
                                console.error('Failed to load:', imageUrl);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                            <p className="text-sm">{photo.labels.join(', ')}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PhotoGrid;