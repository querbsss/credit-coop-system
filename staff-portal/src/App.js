import React, { Fragment, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Members from './pages/Members';
import Accounts from './pages/Accounts';
import Loans from './pages/Loans';
import LoanApplications from './pages/LoanApplications';
import LoansVerified from './pages/LoansVerified';
import LoanReview from './pages/LoanReview';
import LoanApproval from './pages/LoanApproval';
import Transactions from './pages/Transactions';
import CreateInvoice from './pages/CreateInvoice';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';
import UserManagement from './components/UserManagement';
import MembershipApplications from './components/MembershipApplications';

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
                        <RoleBasedDashboard setAuth={setAuth} />
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
                        <ProtectedRoute requiredRoute="/members">
                          <Members setAuth={setAuth} />
                        </ProtectedRoute>
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
                        <ProtectedRoute requiredRoute="/accounts">
                          <Accounts setAuth={setAuth} />
                        </ProtectedRoute>
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
                        <ProtectedRoute requiredRoute="/loans">
                          <Loans setAuth={setAuth} />
                        </ProtectedRoute>
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
                        <ProtectedRoute requiredRoute="/transactions">
                          <Transactions setAuth={setAuth} />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/create-invoice" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/create-invoice">
                          <CreateInvoice />
                        </ProtectedRoute>
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
                        <ProtectedRoute requiredRoute="/reports">
                          <Reports setAuth={setAuth} />
                        </ProtectedRoute>
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
                        <ProtectedRoute requiredRoute="/settings">
                          <Settings setAuth={setAuth} />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/user-management" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/user-management">
                          <UserManagement />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/membership-applications" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/membership-applications">
                          <MembershipApplications />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/loan-applications" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/loan-applications">
                          <LoanApplications setAuth={setAuth} />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/loans-verified" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/loans-verified">
                          <LoansVerified setAuth={setAuth} />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/loan-review" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/loan-review">
                          <LoanReview setAuth={setAuth} />
                        </ProtectedRoute>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/loan-approval" 
              element={
                isAuthenticated ? (
                  <div className="staff-portal">
                    <Header setAuth={setAuth} />
                    <div className="portal-content">
                      <Sidebar />
                      <main className="main-content">
                        <ProtectedRoute requiredRoute="/loan-approval">
                          <LoanApproval setAuth={setAuth} />
                        </ProtectedRoute>
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
