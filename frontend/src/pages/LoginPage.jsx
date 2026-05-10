import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { GraduationCap, Lock, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast.showSuccess('Login successful!');
      navigate('/dashboard');
    } else {
      toast.showError(result.error || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <GraduationCap size={48} />
          </div>
          <h1 className="login-title">Teacher Attendance System</h1>
          <p className="login-subtitle">Anuruddha Balika Vidyalaya</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="username" className="login-label">
              <User size={18} />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              <Lock size={18} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading && <LoadingSpinner size="small" color="white" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Anuruddha Balika Vidyalaya</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
