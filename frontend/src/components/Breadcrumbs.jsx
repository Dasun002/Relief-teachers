import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();

  const pathMap = {
    '/dashboard': 'Dashboard',
    '/teachers': 'Teachers',
    '/attendance': 'Attendance',
    '/substitutions': 'Substitutions',
    '/timetable': 'Timetable',
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on dashboard
  if (pathSegments.length === 0 || location.pathname === '/dashboard') {
    return null;
  }

  const breadcrumbs = [
    { path: '/dashboard', label: 'Home' },
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pathMap[currentPath] || segment;
    breadcrumbs.push({ path: currentPath, label });
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.path} className="breadcrumbs-item">
              {!isLast ? (
                <>
                  <Link to={crumb.path} className="breadcrumbs-link">
                    {crumb.label}
                  </Link>
                  <span className="breadcrumbs-separator">›</span>
                </>
              ) : (
                <span className="breadcrumbs-current">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
