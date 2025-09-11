import React, { Fragment, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Accounts from './pages/Accounts';
import Loans from './pages/Loans';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      const parseRes = await response.json();
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <Fragment>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login setAuth={setAuth} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Dashboard setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/members" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Members setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/accounts" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Accounts setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/loans" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Loans setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/transactions" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Transactions setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/reports" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Reports setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <Settings setAuth={setAuth} />
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;
