import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data - in real app this would come from API
  const mockUser = {
    id: 1,
    memberNumber: "CU001234",
    firstName: "Querby",
    lastName: "Valencia",
    email: "querby.valencia@example.com",
    phone: "(555) 123-4567",
    joinDate: "2020-01-15",
    status: "active",
    accounts: {
      savings: {
        balance: 772025.00,
        accountNumber: "SAV-001234",
        type: "Regular Savings"
      },
      checking: {
        balance: 129037.50,
        accountNumber: "CHK-001234", 
        type: "Free Checking"
      }
    },
    loans: [
      {
        id: 1,
        type: "Auto Loan",
        originalAmount: 1250000,
        currentBalance: 937500.00,
        monthlyPayment: 24275.00,
        interestRate: 3.5,
        nextPayment: "2025-08-01",
        status: "current"
      }
    ],
    recentTransactions: [
      {
        id: 1,
        date: "2025-07-25",
        description: "Direct Deposit - Salary",
        amount: 160000.00,
        type: "credit",
        account: "checking"
      },
      {
        id: 2,
        date: "2025-07-24",
        description: "Auto Loan Payment",
        amount: -24275.00,
        type: "debit",
        account: "checking"
      },
      {
        id: 3,
        date: "2025-07-23",
        description: "Grocery Store",
        amount: -6372.50,
        type: "debit",
        account: "checking"
      },
      {
        id: 4,
        date: "2025-07-22",
        description: "Transfer to Savings",
        amount: -25000.00,
        type: "transfer",
        account: "checking"
      }
    ]
  };

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('memberPortalUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (memberNumber, password) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (memberNumber === "CU001234" && password === "password123") {
          setUser(mockUser);
          localStorage.setItem('memberPortalUser', JSON.stringify(mockUser));
          resolve(mockUser);
        } else {
          reject(new Error('Invalid member number or password'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('memberPortalUser');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
