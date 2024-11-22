import { createContext, useContext, useState, useReducer, useCallback } from 'react';
import { photoAPI, labelAPI } from '../api';

// Create context
const PhotoContext = createContext();

// Initial state
const initialState = {
    photos: [],
    labels: [],
    selectedPhoto: null,
    selectedLabel: null,
    loading: false,
    error: null
};

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_PHOTOS: 'SET_PHOTOS',
    SET_LABELS: 'SET_LABELS',
    SET_SELECTED_PHOTO: 'SET_SELECTED_PHOTO',
    SET_SELECTED_LABEL: 'SET_SELECTED_LABEL',
    ADD_PHOTOS: 'ADD_PHOTOS',
    UPDATE_LABEL: 'UPDATE_LABEL'
};

// Reducer function
function photoReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        case ACTIONS.SET_PHOTOS:
            return { ...state, photos: action.payload, loading: false };
        case ACTIONS.SET_LABELS:
            return { ...state, labels: action.payload, loading: false };
        case ACTIONS.SET_SELECTED_PHOTO:
            return { ...state, selectedPhoto: action.payload };
        case ACTIONS.SET_SELECTED_LABEL:
            return { ...state, selectedLabel: action.payload };
        case ACTIONS.ADD_PHOTOS:
            return { 
                ...state, 
                photos: [...state.photos, ...action.payload],
                loading: false 
            };
        case ACTIONS.UPDATE_LABEL:
            return {
                ...state,
                labels: state.labels.map(label => 
                    label === action.payload.oldName ? action.payload.newName : label
                )
            };
        default:
            return state;
    }
}

// Provider component
export function PhotoProvider({ children }) {
    const [state, dispatch] = useReducer(photoReducer, initialState);

    // Fetch all photos
    const fetchPhotos = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const photos = await photoAPI.getAllPhotos();
            dispatch({ type: ACTIONS.SET_PHOTOS, payload: photos });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, []);

    // Fetch all labels
    const fetchLabels = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const labels = await labelAPI.getAllLabels();
            dispatch({ type: ACTIONS.SET_LABELS, payload: labels });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, []);

    // Upload photos
    const uploadPhotos = useCallback(async (files) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const uploadedPhotos = await photoAPI.uploadPhotos(files);
            dispatch({ type: ACTIONS.ADD_PHOTOS, payload: uploadedPhotos });
            // Refresh labels after upload as new faces might be detected
            await fetchLabels();
            return uploadedPhotos;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    }, [fetchLabels]);

    // Get photos by label
    const getPhotosByLabel = useCallback(async (label) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const photos = await labelAPI.getPhotosByLabel(label);
            dispatch({ type: ACTIONS.SET_PHOTOS, payload: photos });
            dispatch({ type: ACTIONS.SET_SELECTED_LABEL, payload: label });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, []);

    // Set selected photo
    const setSelectedPhoto = useCallback((photo) => {
        dispatch({ type: ACTIONS.SET_SELECTED_PHOTO, payload: photo });
    }, []);

    // Update person name
    const updatePersonName = useCallback(async (oldName, newName) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            await labelAPI.updatePersonName(oldName, newName);
            dispatch({ 
                type: ACTIONS.UPDATE_LABEL, 
                payload: { oldName, newName } 
            });
            // Refresh photos to update labels
            await fetchPhotos();
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, [fetchPhotos]);

    // Clear error
    const clearError = useCallback(() => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    }, []);

    const value = {
        ...state,
        fetchPhotos,
        fetchLabels,
        uploadPhotos,
        getPhotosByLabel,
        setSelectedPhoto,
        updatePersonName,
        clearError
    };

    return (
        <PhotoContext.Provider value={value}>
            {children}
        </PhotoContext.Provider>
    );
}

// Custom hook to use the photo context
export function usePhotoContext() {
    const context = useContext(PhotoContext);
    if (context === undefined) {
        throw new Error('usePhotoContext must be used within a PhotoProvider');
    }
    return context;
}

// // Usage example in App.jsx:
// /*
// import { PhotoProvider } from './context/PhotoContext';

// function App() {
//     return (
//         <PhotoProvider>
//             <Router>
//                 {/* Your app components */}
//             </Router>
//         </PhotoProvider>
//     );
// }
// */

// Usage example in a component:
/*
import { usePhotoContext } from '../context/PhotoContext';

function PhotoGrid() {
    const { 
        photos, 
        loading, 
        error, 
        fetchPhotos, 
        setSelectedPhoto 
    } = usePhotoContext();

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="photo-grid">
            {photos.map(photo => (
                <div 
                    key={photo.id} 
                    onClick={() => setSelectedPhoto(photo)}
                >
                    <img src={photo.url} alt="" />
                </div>
            ))}
        </div>
    );
}
*/
