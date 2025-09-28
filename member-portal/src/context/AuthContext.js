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
          const url = '/auth/is-verify';
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'token': token // backward compatibility
            }
          });
          
          if (response.ok) {
            // Token is valid, fetch user dashboard summary
            const sumRes = await fetch('/dashboard/summary', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'token': token
              }
            });
            if (sumRes.ok) {
              const sumData = await sumRes.json();
              setUser(sumData.user || { authenticated: true });
            } else {
              setUser({ authenticated: true });
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

  const refreshUserSummary = async () => {
    const token = localStorage.getItem('memberPortalToken');
    if (!token) return null;
    try {
      const res = await fetch('/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        return data.user || null;
      }
    } catch (e) {
      console.error('Failed to refresh summary', e);
    }
    return null;
  };

  const login = async (email, password) => {
    try {
      const apiUrl = '/auth/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
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
      
      // Hydrate dashboard summary immediately after login
      try {
        const sumRes = await fetch('/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          }
        });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setUser(sumData.user || { authenticated: true });
        } else {
          setUser({ authenticated: true, ...data.user });
        }
      } catch {
        setUser({ authenticated: true, ...data.user });
      }
      
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
    loading,
    refreshUserSummary
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
