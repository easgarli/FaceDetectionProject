import { useState } from 'react';

function PhotoViewer({ photo, photos, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(
    photos.findIndex((p) => p.id === photo.id)
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="photo-viewer">
      <button className="close-btn" onClick={onClose}>×</button>
      <button className="nav-btn prev" onClick={handlePrev}>‹</button>
      <img src={photos[currentIndex].url} alt="" />
      <button className="nav-btn next" onClick={handleNext}>›</button>
    </div>
  );
}

export default PhotoViewer;