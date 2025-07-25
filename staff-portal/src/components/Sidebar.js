import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/members',
      icon: '👥',
      label: 'Members',
      description: 'Member Management'
    },
    {
      path: '/accounts',
      icon: '💰',
      label: 'Accounts',
      description: 'Account Management'
    },
    {
      path: '/loans',
      icon: '🏦',
      label: 'Loans',
      description: 'Loan Processing'
    },
    {
      path: '/transactions',
      icon: '💳',
      label: 'Transactions',
      description: 'Transaction History'
    },
    {
      path: '/reports',
      icon: '📈',
      label: 'Reports',
      description: 'Financial Reports'
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'System Settings'
    }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-title">Main Menu</h3>
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
  );
};

export default Sidebar;
