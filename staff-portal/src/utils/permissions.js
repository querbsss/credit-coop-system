// Role-based permissions configuration
import { ReactComponent as ReportsIcon } from '../assets/icons/reports-svgrepo-com.svg';
import { ReactComponent as UserIcon } from '../assets/icons/user-svgrepo-com.svg';
import { ReactComponent as MoneyCheckIcon } from '../assets/icons/money-check-dollar-svgrepo-com.svg';
import { ReactComponent as CheckCircleIcon } from '../assets/icons/check-circle-svgrepo-com.svg';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-text-svgrepo-com.svg';

export const PERMISSIONS = {
  // Staff permissions - similar to admin but for staff role
  staff: {
    allowedRoutes: ['/dashboard', '/members', '/reports', '/membership-applications'],
    menuItems: [
      {
        path: '/dashboard',
        icon: ReportsIcon,
        label: 'Dashboard',
        description: 'Staff Overview'
      },
      {
        path: '/members',
        icon: UserIcon,
        label: 'Members',
        description: 'Member Management'
      },
      {
        path: '/membership-applications',
        icon: ClipboardIcon,
        label: 'Applications',
        description: 'Membership Applications'
      },
      {
        path: '/reports',
        icon: ReportsIcon,
        label: 'Reports',
        description: 'System Reports'
      }
    ]
  },
  // Admin permissions - limited to member management and reports
  admin: {
    allowedRoutes: ['/dashboard', '/members', '/reports', '/membership-applications'],
    menuItems: [
      {
        path: '/dashboard',
        icon: '📊',
        label: 'Dashboard',
        description: 'Admin Overview'
      },
      {
        path: '/members',
        icon: '👥',
        label: 'Members',
        description: 'Member Management'
      },
      {
        path: '/membership-applications',
        icon: '📝',
        label: 'Applications',
        description: 'Membership Applications'
      },
      {
        path: '/reports',
        icon: '📈',
        label: 'Reports', 
        description: 'System Reports'
      }
    ]
  },

  // Manager permissions - access to most features except IT functions
  manager: {
    allowedRoutes: ['/dashboard', '/members', '/transactions', '/reports', '/loan-approval', '/membership-applications'],
    menuItems: [
      {
        path: '/dashboard',
        icon: ReportsIcon,
        label: 'Dashboard',
        description: 'Manager Overview'
      },
      {
        path: '/members',
        icon: UserIcon,
        label: 'Members',
        description: 'Member Management'
      },
      {
        path: '/membership-applications',
        icon: ClipboardIcon,
        label: 'Applications',
        description: 'Membership Applications'
      },
      {
        path: '/loan-approval',
        icon: CheckCircleIcon,
        label: 'Loan Approval',
        description: 'Approve/Reject Loans'
      },
      {
        path: '/transactions',
        icon: MoneyCheckIcon,
        label: 'Transactions',
        description: 'Transaction History'
      },
      {
        path: '/reports',
        icon: ReportsIcon,
        label: 'Reports',
        description: 'Financial Reports'
      }
    ]
  },

  // Loan Officer permissions - focused only on loan applications and verification
  loan_officer: {
    allowedRoutes: ['/dashboard', '/loan-applications', '/loans-verified', '/loan-review'],
    menuItems: [
      {
        path: '/dashboard',
        icon: '📊',
        label: 'Dashboard',
        description: 'Loan Officer View'
      },
      {
        path: '/loan-applications',
        icon: '📋',
        label: 'Loan Applications',
        description: 'View All Applications'
      },
      {
        path: '/loan-review',
        icon: '🔍',
        label: 'Loan Review',
        description: 'Review & Process Applications'
      },
      {
        path: '/loans-verified',
        icon: '✅',
        label: 'Loans Verified',
        description: 'Manage Approved Loans'
      }
    ]
  },

  // Cashier permissions - transactions and basic member info
  cashier: {
    allowedRoutes: ['/dashboard', '/members', '/accounts', '/transactions', '/create-invoice'],
    menuItems: [
      {
        path: '/dashboard',
        icon: '📊',
        label: 'Dashboard',
        description: 'Cashier Overview'
      },
      {
        path: '/members',
        icon: '👥',
        label: 'Members',
        description: 'Member Lookup'
      },
      {
        path: '/accounts',
        icon: '💰',
        label: 'Accounts',
        description: 'Account Services'
      },
      {
        path: '/transactions',
        icon: '💳',
        label: 'Transactions',
        description: 'Process Transactions'
      }
      ,
      {
        path: '/create-invoice',
        icon: '🧾',
        label: 'Create Invoice',
        description: 'Issue and print invoices'
      }
    ]
  },

  // IT Admin permissions - system management and settings
  it_admin: {
    allowedRoutes: ['/dashboard', '/members', '/user-management', '/import', '/membership-applications'],
    menuItems: [
      {
        path: '/dashboard',
        icon: ReportsIcon,
        label: 'Dashboard',
        description: 'System Overview'
      },
      {
        path: '/user-management',
        icon: UserIcon,
        label: 'User Management',
        description: 'Staff & Members'
      },
      {
        path: '/membership-applications',
        icon: ClipboardIcon,
        label: 'Applications',
        description: 'Membership Applications'
      },
      {
        path: '/import',
        icon: MoneyCheckIcon,
        label: 'Import Members',
        description: 'Import Member Data'
      }
    ]
  },

  // Credit Investigator permissions - review loan applications
  credit_investigator: {
    allowedRoutes: ['/credit-investigator'],
    menuItems: [
      {
        path: '/credit-investigator',
        icon: ReportsIcon,
        label: 'Credit Investigator',
        description: 'Review Loan Applications'
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
