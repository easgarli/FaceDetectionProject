import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ExploreView from './components/ExploreView';
import Photos from './pages/Photos';
import './styles/index.css';
import { PhotoProvider } from './context/PhotoContext';
import { useState } from 'react';

function App() {
  const [shouldRefreshPhotos, setShouldRefreshPhotos] = useState(false);

  const handleUploadComplete = () => {
    setShouldRefreshPhotos(prev => !prev);
  };

  return (
    <PhotoProvider>
      <Router>
        <div className="app">
          <Sidebar onUploadComplete={handleUploadComplete} />
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={<Photos key={shouldRefreshPhotos} />} 
              />
              <Route 
                path="/photos" 
                element={<Photos key={shouldRefreshPhotos} />} 
              />
              <Route path="/explore" element={<ExploreView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PhotoProvider>
  );
}

export default App;