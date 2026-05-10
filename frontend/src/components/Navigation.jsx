import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  Home, 
  ClipboardList, 
  RefreshCw, 
  Calendar, 
  Users, 
  Menu, 
  GraduationCap, 
  User, 
  LogOut,
  Lock
} from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, adminOnly: false },
    { path: '/attendance', label: 'Attendance', icon: ClipboardList, adminOnly: true },
    { path: '/substitutions', label: 'Substitutions', icon: RefreshCw, adminOnly: false },
    { path: '/timetable', label: 'Timetable', icon: Calendar, adminOnly: false },
    { path: '/teachers', label: 'Teachers', icon: Users, adminOnly: true },
  ];

  const isActive = (path) => location.pathname === path;

  const canAccess = (link) => {
    return !link.adminOnly || user?.role === 'admin';
  };

  const handleLinkClick = (link) => {
    if (!canAccess(link)) {
      toast.showError('This feature is only available to administrators.');
      return;
    }
    navigate(link.path);
  };

  const handleLogout = () => {
    logout();
    toast.showInfo('You have been logged out.');
    navigate('/login');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="top-header">
        <div className="top-header-left">
          <button 
            onClick={toggleSidebar} 
            className={`sidebar-toggle ${sidebarOpen ? 'spin-open' : 'spin-close'}`}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <Link to="/dashboard" className="header-brand">
            <GraduationCap size={28} className="header-brand-icon" />
            <span className="header-brand-text">Teacher Attendance System</span>
          </Link>
        </div>
        <div className="top-header-right">
          <div className="header-user-info">
            <User size={20} className="header-user-icon" />
            <span className="header-user-name">{user?.username}</span>
            <span className="header-user-role">({user?.role})</span>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Navigation</h3>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            const accessible = canAccess(link);
            const IconComponent = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link)}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''} ${!accessible ? 'disabled' : ''}`}
                disabled={!accessible}
                title={!accessible ? 'Admin only' : link.label}
              >
                <IconComponent size={20} className="sidebar-link-icon" />
                <span className="sidebar-link-text">{link.label}</span>
                {!accessible && <Lock size={16} className="sidebar-link-badge" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout">
            <LogOut size={20} className="sidebar-logout-icon" />
            <span className="sidebar-logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Navigation;
