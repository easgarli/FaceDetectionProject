import { useState } from 'react';
import { photoAPI } from '../api';
import { 
    optimizeImage, 
    createThumbnail, 
    validateImageDimensions 
} from '../utils/imageOptimization';

function PhotoUpload({ onUploadComplete }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (event) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            const files = event.target.files;
            
            for (let i = 0; i < files.length; i++) {
                formData.append('photos', files[i]);
            }
            
            await photoAPI.uploadPhotos(formData);
            
            // Reset the file input
            event.target.value = '';
            
            // Notify parent component that upload is complete
            if (onUploadComplete) {
                onUploadComplete();
            }
            
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (event) => {
        await handleUpload(event);
        onUploadComplete();
    };

    return (
        <div>
            <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default PhotoUpload; 