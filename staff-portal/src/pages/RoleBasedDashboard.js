import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import CashierDashboard from './CashierDashboard';

const RoleBasedDashboard = ({ setAuth }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "token": localStorage.token 
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role);
                } else {
                    // If profile fetch fails, user might not be authenticated
                    localStorage.removeItem("token");
                    setAuth(false);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Failed to load user profile");
                localStorage.removeItem("token");
                setAuth(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [setAuth]);

    const updateLoanAmount = async (loanId, newAmount) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/loans/${loanId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "token": localStorage.token
                },
                body: JSON.stringify({ loan_amount: newAmount })
            });

            if (!response.ok) {
                throw new Error(`Failed to update loan amount: ${response.status}`);
            }

            const result = await response.json();
            console.log("Loan amount updated successfully:", result);
            alert("Loan amount updated successfully.");
        } catch (error) {
            console.error("Error updating loan amount:", error);
            alert("Failed to update loan amount. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <div className="spinner" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 2s linear infinite'
                }}></div>
                <p style={{ marginTop: '20px', color: '#666' }}>Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return <Navigate to="/login" replace />;
    }

    // Render specialized dashboard for cashier role
    if (userRole === 'cashier') {
        return <CashierDashboard setAuth={setAuth} />;
    }

    // Default dashboard for other roles
    return <Dashboard setAuth={setAuth} userRole={userRole} updateLoanAmount={updateLoanAmount} />;
};

export default RoleBasedDashboard;
