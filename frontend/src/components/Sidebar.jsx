import { Link, useLocation } from 'react-router-dom';
import PhotoUpload from './PhotoUpload';
import { photoAPI } from '../api';

function Sidebar({ onUploadComplete }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const buttonStyle = {
        width: '100%',
        minHeight: '60px',
        padding: '16px 32px',
        borderRadius: '8px',
        transition: 'all 0.2s',
        fontSize: '18px',
        fontWeight: '600',
        backgroundColor: '#374151',
        color: '#d1d5db',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        try {
            await photoAPI.uploadPhotos(formData);
            onUploadComplete();
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading photos:', error);
        }
    };

    return (
        <nav style={{ 
            width: '256px',
            minHeight: '100vh',
            backgroundColor: '#1f2937',
            padding: '24px',
            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* App Title */}
            <h1 style={{
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '10px',
                textAlign: 'left',
                paddingLeft: '32px'
            }}>
                FamilyFace
            </h1>
            <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '48px',
                textAlign: 'left',
                paddingLeft: '32px'
            }}>
                Photo Prediction App
            </h1>
            {/* Navigation Buttons */}
            <ul style={{ 
                listStyleType: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
            }}>
                <li style={{ listStyleType: 'none', width: '100%' }}>
                    <Link to="/" style={{ display: 'block', width: '100%' }}>
                        <button 
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '16px 32px',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                fontSize: '18px',
                                fontWeight: '600',
                                backgroundColor: isActive('/') ? '#2563eb' : '#374151',
                                color: isActive('/') ? 'white' : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            Photos
                        </button>
                    </Link>
                </li>

                <li style={{ listStyleType: 'none', width: '100%' }}>
                    <Link to="/explore" style={{ display: 'block', width: '100%' }}>
                        <button 
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '16px 32px',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                fontSize: '18px',
                                fontWeight: '600',
                                backgroundColor: isActive('/explore') ? '#2563eb' : '#374151',
                                color: isActive('/explore') ? 'white' : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            Explore
                        </button>
                    </Link>
                </li>
            </ul>

            {/* Upload Section */}
            <div style={{
                marginTop: 'auto',
                marginBottom: 'auto',
                width: '100%',
                padding: '20px 0',
            }}>
                <div style={{ width: '100%' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '25px',
                        textAlign: 'left',
                        paddingLeft: '32px'
                    }}>
                        Upload Photos
                    </h2>
                    <div style={{ padding: '0 24px' }}>
                        <label htmlFor="file-upload" style={buttonStyle}>
                            Choose Files
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <p style={{
                            fontSize: '16px',
                            color: '#d1d5db',
                            marginTop: '30px',
                            textAlign: 'left',
                            paddingLeft: '8px',
                            width: '100%',
                            wordWrap: 'break-word'
                        }}>
                            Choose photos to upload
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;