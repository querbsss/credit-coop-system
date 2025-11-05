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
            // Token is valid, fetch user dashboard data from backend
            const dashboardRes = await fetch('http://localhost:5001/dashboard', {
              headers: {
                'token': token
              }
            });
            if (dashboardRes.ok) {
              const userData = await dashboardRes.json();
              setUser({ authenticated: true, ...userData });
            } else {
              setUser({ authenticated: true }); // fallback
            }
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

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('memberPortalToken');
      const response = await fetch('http://localhost:5001/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(prev => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('memberPortalToken');
      const response = await fetch('http://localhost:5001/auth/password/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update password');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to update password');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        await response.json(); // Parse if JSON
      }
      
      return true;
    } catch (error) {
      throw new Error(error.message || 'Password update failed');
    }
  };

  const fetchMembershipData = async () => {
    try {
      const token = localStorage.getItem('memberPortalToken');
      console.log('Fetching membership data with token:', token);
      const response = await fetch('http://localhost:5001/auth/membership-data', {
        headers: {
          'token': token
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Membership data fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to fetch membership data: ${errorText}`);
      }

      const data = await response.json();
      console.log('Membership data received:', data);
      return data;
    } catch (error) {
      console.error('Membership data fetch error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateProfile,
    updatePassword,
    fetchMembershipData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
