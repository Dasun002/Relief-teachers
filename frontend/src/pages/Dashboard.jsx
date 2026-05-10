import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Debug logging
  useEffect(() => {
    console.log('Dashboard - user object:', user);
    console.log('Dashboard - user role:', user?.role);
    console.log('Dashboard - user username:', user?.username);
  }, [user]);

  const dashboardCards = [
    {
      title: 'Teachers',
      description: 'Manage teacher information',
      path: '/teachers',
      adminOnly: true
    },
    {
      title: 'Attendance',
      description: 'Record and view attendance',
      path: '/attendance',
      adminOnly: true
    },
    {
      title: 'Substitutions',
      description: 'Manage teacher substitutions',
      path: '/substitutions',
      adminOnly: false
    },
    {
      title: 'Timetable',
      description: 'View and import timetables',
      path: '/timetable',
      adminOnly: false
    }
  ];

  const handleCardClick = (card) => {
    // Allow navigation if card is not admin-only OR user is admin
    if (!card.adminOnly || user?.role === 'admin') {
      navigate(card.path);
    } else {
      toast.showError('This feature is only available to administrators.');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Welcome Back!</h1>
          <p className="dashboard-subtitle">
            Quick access to all features
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {dashboardCards.map((card) => {
          const isDisabled = card.adminOnly && user?.role !== 'admin';
          return (
            <div
              key={card.path}
              onClick={() => handleCardClick(card)}
              className={`dashboard-card ${isDisabled ? 'disabled' : ''}`}
            >
              <h3 className="dashboard-card-title">{card.title}</h3>
              <p className="dashboard-card-description">{card.description}</p>
              {isDisabled && (
                <p className="dashboard-card-badge">Admin only</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
