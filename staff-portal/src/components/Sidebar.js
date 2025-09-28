import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { getMenuItems } from '../utils/permissions';
import Icon from './Icon';
import './Sidebar.css';

const Sidebar = () => {
  const { userRole, loading } = useUserRole();

  // Get menu items based on user role
  const menuItems = userRole ? getMenuItems(userRole) : [];

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-loading">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
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
                  <span className="nav-icon">
                    {/* item.icon is expected to be an Icon name (e.g., 'barChart'). */}
                    <Icon name={item.icon} size={20} />
                  </span>
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
  );
};

export default Sidebar;
