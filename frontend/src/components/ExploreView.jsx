import { useState, useEffect } from 'react';
import { photoAPI } from '../api';

function ExploreView() {
    const [labels, setLabels] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabelValue, setNewLabelValue] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchLabels();
        fetchPhotos();
    }, []);

    const fetchLabels = async () => {
        try {
            const response = await photoAPI.getAllLabels();
            setLabels(response.labels);
        } catch (error) {
            console.error('Error fetching labels:', error);
        }
    };

    const fetchPhotos = async () => {
        try {
            const response = await photoAPI.getAllPhotos();
            setPhotos(response.photos);
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    };

    const handleLabelUpdate = async (oldLabel) => {
        if (!newLabelValue.trim() || newLabelValue === oldLabel) return;
        
        try {
            await photoAPI.updateLabel(oldLabel, newLabelValue.trim());
            // Refresh both labels and photos
            await fetchLabels();
            await fetchPhotos();
            setEditingLabel(null);
            setNewLabelValue('');
            setSelectedLabel(newLabelValue.trim()); // Update selected label to new value
        } catch (error) {
            console.error('Error updating label:', error);
        }
    };

    const filteredPhotos = selectedLabel
        ? photos.filter(photo => photo.labels.includes(selectedLabel))
        : photos;

    return (
        <div className="p-6">
            {/* Labels Section */}
            <div style={{
                marginBottom: '32px',
                padding: '20px',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '16px'
                }}>
                    People
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '20px',
                    padding: '10px'
                }}>
                    {labels.map((label) => (
                        <div key={label} 
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {editingLabel === label ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    width: '100%'
                                }}>
                                    <input
                                        type="text"
                                        value={newLabelValue}
                                        onChange={(e) => setNewLabelValue(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: '#374151',
                                            color: 'white',
                                            border: '1px solid #4B5563',
                                            borderRadius: '8px',
                                            outline: 'none'
                                        }}
                                        placeholder="Enter new name"
                                        autoFocus
                                    />
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        width: '100%'
                                    }}>
                                        <button
                                            onClick={() => handleLabelUpdate(label)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                backgroundColor: '#059669',
                                                color: 'white',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingLabel(null);
                                                setNewLabelValue('');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                backgroundColor: '#DC2626',
                                                color: 'white',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setSelectedLabel(label === selectedLabel ? null : label)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 24px',
                                            backgroundColor: label === selectedLabel ? '#2563EB' : '#374151',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {label}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingLabel(label);
                                            setNewLabelValue(label);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '6px 12px',
                                            backgroundColor: '#4B5563',
                                            color: '#E5E7EB',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Photos Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '24px',
                padding: '20px',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
            }}>
                {filteredPhotos.map((photo, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'relative',
                            aspectRatio: '1',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                        onClick={() => window.open(`${API_URL}/static/uploaded_photos/${photo.path}`, '_blank')}
                    >
                        <img
                            src={`${API_URL}/static/uploaded_photos/${photo.thumbnail}`}
                            alt={`Photo ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExploreView;