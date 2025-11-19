import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { getMenuItems } from '../utils/permissions';
import './Sidebar.css';

const Sidebar = () => {
  const { userRole, loading } = useUserRole();
  const [open, setOpen] = useState(false);

  // Get menu items based on user role
  const menuItems = userRole ? getMenuItems(userRole) : [];

  if (loading) {
    return (
      <aside className={"sidebar" + (open ? ' open' : '')}>
        <div className="sidebar-loading">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      </aside>
    );
  }

  useEffect(() => {
    const onToggle = () => setOpen(o => !o);
    const onClose = () => setOpen(false);
    window.addEventListener('toggleSidebar', onToggle);
    window.addEventListener('closeSidebar', onClose);
    // cleanup
    return () => {
      window.removeEventListener('toggleSidebar', onToggle);
      window.removeEventListener('closeSidebar', onClose);
    };
  }, []);

  return (
    <>
      <aside className={"sidebar" + (open ? ' open' : '')}>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-title">Main Menu</h3>
          <div className="user-role-indicator">
            <span className="role-badge">{userRole?.replace('_', ' ').toUpperCase()}</span>
          </div>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      </aside>
      {/* Backdrop for mobile when sidebar is open */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
