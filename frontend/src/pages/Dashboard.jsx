import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';
import ProcessingQueue from '../components/ProcessingQueue';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🎥 Video Platform</h2>
        </div>
        <div className="nav-user">
          <span className="user-info">
            {user?.username} ({user?.role})
          </span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            disabled={user?.role === 'viewer'}
          >
            Upload Video
          </button>
          <button
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            My Videos
          </button>
          <button
            className={`tab ${activeTab === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveTab('processing')}
          >
            Processing Queue
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'upload' && user?.role !== 'viewer' && (
            <VideoUpload />
          )}
          {activeTab === 'videos' && <VideoList />}
          {activeTab === 'processing' && <ProcessingQueue />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
