import PhotoUpload from '../components/PhotoUpload';
import PhotoGrid from '../components/PhotoGrid';
import { useState } from 'react';

function Photos() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadComplete = (result) => {
        console.log('Upload complete:', result);
        // Increment refresh trigger to force grid reload
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Photos</h1>
            <PhotoUpload onUploadComplete={handleUploadComplete} />
            <div className="mt-6">
                <PhotoGrid key={refreshTrigger} />
            </div>
        </div>
    );
}

export default Photos; 