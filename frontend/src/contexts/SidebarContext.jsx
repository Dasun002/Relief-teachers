import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Update CSS custom property when sidebar state changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      sidebarOpen ? '260px' : '0px'
    );
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
