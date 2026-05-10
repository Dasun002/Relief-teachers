import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * LoadingSpinner Component
 * Displays a loading spinner for async operations
 * 
 * @param {Object} props
 * @param {string} props.size - Size of spinner: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} props.color - Color of spinner (default: '#3b82f6')
 * @param {string} props.text - Optional loading text to display
 * @param {boolean} props.fullScreen - Whether to display as fullscreen overlay (default: false)
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#3b82f6', 
  text = '', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  const spinnerContent = (
    <div className="spinner-container">
      <div 
        className={`spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
