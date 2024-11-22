import { useState } from 'react';
import { photoAPI } from '../api';
import { 
    optimizeImage, 
    createThumbnail, 
    validateImageDimensions 
} from '../utils/imageOptimization';

function PhotoUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState([]);
    const [error, setError] = useState(null);

    const handleUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setUploading(true);
        setError(null);
        setProgress([]);

        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('photos', file);
            });

            setProgress(prev => [...prev, 'Uploading to server...']);
            
            const result = await photoAPI.uploadPhotos(formData);
            
            setProgress(prev => [
                ...prev, 
                'Upload complete!',
                ...result.map(photo => 
                    `Detected faces in ${photo.file}: ${photo.labels.join(', ') || 'None'}`
                )
            ]);

            if (typeof onUploadComplete === 'function') {
                onUploadComplete(result);
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="photo-upload p-4 border rounded-lg">
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
            />
            
            {/* Progress Messages */}
            {progress.length > 0 && (
                <div className="mt-4 space-y-2">
                    {progress.map((message, index) => (
                        <p key={index} className="text-sm text-gray-600">
                            {message}
                        </p>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-500">
                    Error: {error}
                </p>
            )}

            {/* Upload Status */}
            {uploading && (
                <div className="mt-4">
                    <div className="animate-pulse bg-blue-100 h-2 rounded-full" />
                </div>
            )}
        </div>
    );
}

export default PhotoUpload; 