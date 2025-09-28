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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('memberPortalToken');
        if (token) {
          // Verify token with server
          const response = await fetch('http://localhost:5001/auth/is-verify', {
            headers: {
              'token': token
            }
          });
          
          if (response.ok) {
            // Token is valid, fetch user data from server
            // You can add a user info endpoint here
            setUser({ authenticated: true });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('memberPortalToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('memberPortalToken');
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (memberNumber, password) => {
    try {
      const response = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberNumber: memberNumber,
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      
      // Store the JWT token
      localStorage.setItem('memberPortalToken', data.token);
      
      // Set user as authenticated
      setUser({ authenticated: true, ...data.user });
      
      return data.user;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('memberPortalToken');
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
