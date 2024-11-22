import { useState, useEffect } from 'react';
import { usePhotoContext } from '../context/PhotoContext';
import '../styles/PersonCard.css';

const PersonCard = ({ person, isSelected }) => {
    const { getPhotosByLabel, photos } = usePhotoContext();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(person);

    // Find the first photo containing this person to use as avatar
    useEffect(() => {
        const findAvatar = async () => {
            try {
                // Get the first photo where this person appears
                const personPhotos = await getPhotosByLabel(person);
                if (personPhotos && personPhotos.length > 0) {
                    setAvatarUrl(personPhotos[0].url);
                }
            } catch (error) {
                console.error('Error loading avatar:', error);
            }
        };

        findAvatar();
    }, [person, getPhotosByLabel]);

    const handleClick = () => {
        getPhotosByLabel(person);
    };

    const handleEditClick = (e) => {
        e.stopPropagation(); // Prevent triggering the card click
        setIsEditing(true);
    };

    const handleNameChange = (e) => {
        setNewName(e.target.value);
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (newName.trim() && newName !== person) {
            try {
                await updatePersonName(person, newName.trim());
                setIsEditing(false);
            } catch (error) {
                console.error('Error updating name:', error);
            }
        } else {
            setNewName(person);
            setIsEditing(false);
        }
    };

    return (
        <div 
            className={`person-card ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
        >
            <div className="person-avatar">
                {avatarUrl ? (
                    <img 
                        src={avatarUrl} 
                        alt={`${person}'s avatar`}
                        className="avatar-image"
                    />
                ) : (
                    <div className="avatar-placeholder">
                        {person.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            
            <div className="person-info">
                {isEditing ? (
                    <form onSubmit={handleNameSubmit} className="edit-name-form">
                        <input
                            type="text"
                            value={newName}
                            onChange={handleNameChange}
                            autoFocus
                            onBlur={handleNameSubmit}
                            className="name-input"
                        />
                    </form>
                ) : (
                    <>
                        <span className="person-name">{person}</span>
                        <button 
                            className="edit-button"
                            onClick={handleEditClick}
                            title="Edit name"
                        >
                            ✎
                        </button>
                    </>
                )}
                <span className="photo-count">
                    {photos.filter(photo => 
                        photo.labels.includes(person)
                    ).length} photos
                </span>
            </div>
        </div>
    );
};

export default PersonCard;
