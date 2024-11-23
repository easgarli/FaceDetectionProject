import { createContext, useContext, useState } from 'react';

// Create the context
const PhotoContext = createContext();

// Create the provider component
export function PhotoProvider({ children }) {
    const [photos, setPhotos] = useState([]);
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const refreshPhotos = () => {
        setShouldRefresh(prev => !prev);
    };

    const value = {
        photos,
        setPhotos,
        shouldRefresh,
        refreshPhotos
    };

    return (
        <PhotoContext.Provider value={value}>
            {children}
        </PhotoContext.Provider>
    );
}

// Create the custom hook
export function usePhotoContext() {
    const context = useContext(PhotoContext);
    if (context === undefined) {
        throw new Error('usePhotoContext must be used within a PhotoProvider');
    }
    return context;
}

// Don't export the context directly, only export the Provider and hook
export default PhotoProvider;
