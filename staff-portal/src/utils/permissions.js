// Role-based permissions configuration
export const PERMISSIONS = {
  // Admin permissions - limited to member management and reports
  admin: {
    allowedRoutes: ['/dashboard', '/members', '/reports'],
    menuItems: [
      {
        path: '/dashboard',
        icon: 'barChart',
        label: 'Dashboard',
        description: 'Admin Overview'
      },
      {
        path: '/members',
        icon: 'users',
        label: 'Members',
        description: 'Member Management'
      },
      {
        path: '/reports',
        icon: 'trendingUp',
        label: 'Reports', 
        description: 'System Reports'
      }
    ]
  },

  // Manager permissions - access to most features except IT functions
  manager: {
    allowedRoutes: ['/dashboard', '/members', '/accounts', '/loans', '/transactions', '/reports'],
    menuItems: [
      {
        path: '/dashboard',
        icon: 'barChart',
        label: 'Dashboard',
        description: 'Manager Overview'
      },
      {
        path: '/members',
        icon: 'users',
        label: 'Members',
        description: 'Member Management'
      },
      {
        path: '/accounts',
        icon: 'savings',
        label: 'Accounts',
        description: 'Account Management'
      },
      {
        path: '/loans',
        icon: 'home',
        label: 'Loans',
        description: 'Loan Management'
      },
      {
        path: '/transactions',
        icon: 'creditCard',
        label: 'Transactions',
        description: 'Transaction History'
      },
      {
        path: '/reports',
        icon: 'trendingUp',
        label: 'Reports',
        description: 'Financial Reports'
      }
    ]
  },

  // Loan Officer permissions - focused only on loan applications and verification
  loan_officer: {
    allowedRoutes: ['/dashboard', '/loan-applications', '/loans-verified'],
    menuItems: [
      {
        path: '/dashboard',
        icon: 'barChart',
        label: 'Dashboard',
        description: 'Loan Officer View'
      },
      {
        path: '/loan-applications',
        icon: 'fileText',
        label: 'Loan Applications',
        description: 'Review Applications'
      },
      {
        path: '/loans-verified',
        icon: 'shield',
        label: 'Loans Verified',
        description: 'Manage Approved Loans'
      }
    ]
  },

  // Cashier permissions - transactions and basic member info
  cashier: {
    allowedRoutes: ['/dashboard', '/members', '/accounts', '/transactions'],
    menuItems: [
      {
        path: '/dashboard',
        icon: 'barChart',
        label: 'Dashboard',
        description: 'Cashier Overview'
      },
      {
        path: '/members',
        icon: 'users',
        label: 'Members',
        description: 'Member Lookup'
      },
      {
        path: '/accounts',
        icon: 'savings',
        label: 'Accounts',
        description: 'Account Services'
      },
      {
        path: '/transactions',
        icon: 'creditCard',
        label: 'Transactions',
        description: 'Process Transactions'
      }
    ]
  },

  // IT Admin permissions - system management and settings
  it_admin: {
    allowedRoutes: ['/dashboard', '/members', '/reports', '/settings'],
    menuItems: [
      {
        path: '/dashboard',
        icon: 'barChart',
        label: 'Dashboard',
        description: 'System Overview'
      },
      {
        path: '/members',
        icon: 'users',
        label: 'User Management',
        description: 'Staff & Members'
      },
      {
        path: '/reports',
        icon: 'trendingUp',
        label: 'System Reports',
        description: 'Usage & Performance'
      },
      {
        path: '/settings',
        icon: 'settings',
        label: 'Settings',
        description: 'System Configuration'
      }
    ]
  }
};

// Helper function to check if user has permission for a route
export const hasPermission = (userRole, route) => {
  if (!userRole || !PERMISSIONS[userRole]) {
    return false;
  }
  return PERMISSIONS[userRole].allowedRoutes.includes(route);
};

// Helper function to get menu items for a role
export const getMenuItems = (userRole) => {
  if (!userRole || !PERMISSIONS[userRole]) {
    return [];
  }
  return PERMISSIONS[userRole].menuItems;
};

// Helper function to get allowed routes for a role
export const getAllowedRoutes = (userRole) => {
  if (!userRole || !PERMISSIONS[userRole]) {
    return [];
  }
  return PERMISSIONS[userRole].allowedRoutes;
};
