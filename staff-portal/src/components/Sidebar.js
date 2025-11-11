import React from 'react';
import { ReactComponent as ReportsIcon } from '../assets/icons/reports-svgrepo-com.svg';
import { ReactComponent as UserIcon } from '../assets/icons/user-svgrepo-com.svg';
import { ReactComponent as MoneyCheckIcon } from '../assets/icons/money-check-dollar-svgrepo-com.svg';
import { ReactComponent as CheckCircleIcon } from '../assets/icons/check-circle-svgrepo-com.svg';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-text-svgrepo-com.svg';
import { NavLink } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { getMenuItems } from '../utils/permissions';
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
                  {({ isActive }) => (
                    <>
                      <span className="nav-icon">
                        {item.icon ? (
                          <item.icon 
                            style={{ 
                              width: 24, 
                              height: 24, 
                              color: isActive ? '#7c3aed' : '#bda6cc',
                              fill: isActive ? '#7c3aed' : '#bda6cc',
                              stroke: isActive ? '#7c3aed' : '#bda6cc'
                            }} 
                          />
                        ) : null}
                      </span>
                      <div className="nav-content">
                        <span className="nav-label">{item.label}</span>
                        <span className="nav-description">{item.description}</span>
                      </div>
                    </>
                  )}
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
