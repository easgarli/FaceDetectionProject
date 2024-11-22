import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ExploreView from './components/ExploreView';
import Photos from './pages/Photos';
import './styles/index.css';
import { PhotoProvider } from './context/PhotoContext';

function App() {
  return (
    <PhotoProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Photos />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/explore" element={<ExploreView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PhotoProvider>
  );
}

export default App;