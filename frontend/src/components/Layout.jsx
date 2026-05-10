import PropTypes from 'prop-types';
import Navigation from './Navigation';
import Breadcrumbs from './Breadcrumbs';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <div className="layout-main">
        <Breadcrumbs />
        <main className="layout-content">
          {children}
        </main>
        <footer className="layout-footer">
          <div className="layout-footer-content">
            <p>© 2026 Anuruddha Balika Vidyalaya - Teacher Attendance System</p>
            <p className="layout-footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Help coming soon!'); }}>Help</a>
              {' • '}
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy coming soon!'); }}>Privacy</a>
              {' • '}
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms coming soon!'); }}>Terms</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
