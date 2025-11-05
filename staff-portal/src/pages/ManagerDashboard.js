import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';

const ManagerDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        totalMembers: 0,
        activeLoanApplications: 0,
        staffPerformance: 0
    });
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch("http://localhost:5000/auth/profile", {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "token": localStorage.token 
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserInfo(userData);
                }
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        };

        fetchUserInfo();
    }, []);

    // Generate dummy data for the report
    const generateDummyReportData = () => {
        return {
            reportDate: new Date().toLocaleDateString(),
            summary: {
                totalMembers: 1247,
                activeMembers: 1185,
                inactiveMembers: 62,
                newMembersThisMonth: 23
            },
            financials: {
                totalSavings: 15750000,
                totalLoanBalances: 8920000,
                totalProfitFromLoans: 1340000,
                averageSavingsPerMember: 12640.83,
                averageLoanBalance: 18954.26
            },
            memberBalances: [
                { id: 'M001', name: 'Juan Dela Cruz', savings: 75000, loanBalance: 120000, totalContribution: 195000 },
                { id: 'M002', name: 'Maria Santos', savings: 45000, loanBalance: 0, totalContribution: 45000 },
                { id: 'M003', name: 'Pedro Rodriguez', savings: 28000, loanBalance: 85000, totalContribution: 113000 },
                { id: 'M004', name: 'Ana Garcia', savings: 92000, loanBalance: 150000, totalContribution: 242000 },
                { id: 'M005', name: 'Carlos Mendoza', savings: 35000, loanBalance: 75000, totalContribution: 110000 },
                { id: 'M006', name: 'Rosa Villanueva', savings: 68000, loanBalance: 0, totalContribution: 68000 },
                { id: 'M007', name: 'Miguel Torres', savings: 55000, loanBalance: 95000, totalContribution: 150000 },
                { id: 'M008', name: 'Sofia Reyes', savings: 41000, loanBalance: 60000, totalContribution: 101000 },
                { id: 'M009', name: 'Roberto Cruz', savings: 78000, loanBalance: 180000, totalContribution: 258000 },
                { id: 'M010', name: 'Carmen Lopez', savings: 33000, loanBalance: 45000, totalContribution: 78000 }
            ],
            loanProfitBreakdown: {
                personalLoans: {
                    totalAmount: 3200000,
                    interestEarned: 480000,
                    avgInterestRate: 15
                },
                businessLoans: {
                    totalAmount: 4800000,
                    interestEarned: 720000,
                    avgInterestRate: 15
                },
                emergencyLoans: {
                    totalAmount: 920000,
                    interestEarned: 138000,
                    avgInterestRate: 15
                }
            },
            monthlyTrends: {
                savingsGrowth: 3.2,
                loanDisbursements: 850000,
                collections: 720000,
                netGrowth: 2.8
            }
        };
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        
        // Simulate API call delay
        setTimeout(() => {
            setIsGeneratingReport(false);
            setShowReportModal(true);
        }, 2000);
    };

    const downloadReport = (format) => {
        const reportData = generateDummyReportData();
        
        if (format === 'csv') {
            downloadCSVReport(reportData);
        } else if (format === 'pdf') {
            downloadPDFReport(reportData);
        }
    };

    const downloadCSVReport = (data) => {
        let csvContent = "Credit Cooperative Financial Report\n";
        csvContent += `Report Date: ${data.reportDate}\n\n`;
        
        // Summary section
        csvContent += "MEMBERSHIP SUMMARY\n";
        csvContent += "Category,Count\n";
        csvContent += `Total Members,${data.summary.totalMembers}\n`;
        csvContent += `Active Members,${data.summary.activeMembers}\n`;
        csvContent += `Inactive Members,${data.summary.inactiveMembers}\n`;
        csvContent += `New Members This Month,${data.summary.newMembersThisMonth}\n\n`;
        
        // Financial summary
        csvContent += "FINANCIAL SUMMARY\n";
        csvContent += "Category,Amount (PHP)\n";
        csvContent += `Total Savings,${data.financials.totalSavings.toLocaleString()}\n`;
        csvContent += `Total Loan Balances,${data.financials.totalLoanBalances.toLocaleString()}\n`;
        csvContent += `Total Profit from Loans,${data.financials.totalProfitFromLoans.toLocaleString()}\n`;
        csvContent += `Average Savings per Member,${data.financials.averageSavingsPerMember.toLocaleString()}\n`;
        csvContent += `Average Loan Balance,${data.financials.averageLoanBalance.toLocaleString()}\n\n`;
        
        // Member balances
        csvContent += "MEMBER BALANCES\n";
        csvContent += "Member ID,Name,Savings (PHP),Loan Balance (PHP),Total Contribution (PHP)\n";
        data.memberBalances.forEach(member => {
            csvContent += `${member.id},${member.name},${member.savings.toLocaleString()},${member.loanBalance.toLocaleString()},${member.totalContribution.toLocaleString()}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadPDFReport = (data) => {
        // For PDF generation, you would typically use a library like jsPDF
        // For now, we'll create a simplified HTML version that can be printed
        const reportWindow = window.open('', '_blank');
        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Financial Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 25px; }
                    .section h2 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .summary-card { background: #f8f9fc; padding: 15px; border-radius: 8px; }
                    .amount { font-weight: bold; color: #7c3aed; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Credit Cooperative Financial Report</h1>
                    <p>Generated on: ${data.reportDate}</p>
                </div>
                
                <div class="section">
                    <h2>Membership Summary</h2>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <strong>Total Members:</strong> ${data.summary.totalMembers}<br>
                            <strong>Active Members:</strong> ${data.summary.activeMembers}<br>
                        </div>
                        <div class="summary-card">
                            <strong>Inactive Members:</strong> ${data.summary.inactiveMembers}<br>
                            <strong>New Members This Month:</strong> ${data.summary.newMembersThisMonth}
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Financial Overview</h2>
                    <table>
                        <tr><th>Category</th><th>Amount (PHP)</th></tr>
                        <tr><td>Total Savings</td><td class="amount">₱${data.financials.totalSavings.toLocaleString()}</td></tr>
                        <tr><td>Total Loan Balances</td><td class="amount">₱${data.financials.totalLoanBalances.toLocaleString()}</td></tr>
                        <tr><td>Total Profit from Loans</td><td class="amount">₱${data.financials.totalProfitFromLoans.toLocaleString()}</td></tr>
                        <tr><td>Average Savings per Member</td><td class="amount">₱${data.financials.averageSavingsPerMember.toLocaleString()}</td></tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Top 10 Member Balances</h2>
                    <table>
                        <tr><th>Member ID</th><th>Name</th><th>Savings</th><th>Loan Balance</th><th>Total Contribution</th></tr>
                        ${data.memberBalances.map(member => 
                            `<tr>
                                <td>${member.id}</td>
                                <td>${member.name}</td>
                                <td class="amount">₱${member.savings.toLocaleString()}</td>
                                <td class="amount">₱${member.loanBalance.toLocaleString()}</td>
                                <td class="amount">₱${member.totalContribution.toLocaleString()}</td>
                            </tr>`
                        ).join('')}
                    </table>
                </div>
                
                <div class="section">
                    <h2>Loan Profit Breakdown</h2>
                    <table>
                        <tr><th>Loan Type</th><th>Total Amount</th><th>Interest Earned</th><th>Avg Rate</th></tr>
                        <tr><td>Personal Loans</td><td class="amount">₱${data.loanProfitBreakdown.personalLoans.totalAmount.toLocaleString()}</td><td class="amount">₱${data.loanProfitBreakdown.personalLoans.interestEarned.toLocaleString()}</td><td>${data.loanProfitBreakdown.personalLoans.avgInterestRate}%</td></tr>
                        <tr><td>Business Loans</td><td class="amount">₱${data.loanProfitBreakdown.businessLoans.totalAmount.toLocaleString()}</td><td class="amount">₱${data.loanProfitBreakdown.businessLoans.interestEarned.toLocaleString()}</td><td>${data.loanProfitBreakdown.businessLoans.avgInterestRate}%</td></tr>
                        <tr><td>Emergency Loans</td><td class="amount">₱${data.loanProfitBreakdown.emergencyLoans.totalAmount.toLocaleString()}</td><td class="amount">₱${data.loanProfitBreakdown.emergencyLoans.interestEarned.toLocaleString()}</td><td>${data.loanProfitBreakdown.emergencyLoans.avgInterestRate}%</td></tr>
                    </table>
                </div>
            </body>
            </html>
        `;
        
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
            reportWindow.print();
        }, 1000);
    };

    const ReportModal = () => {
        const data = generateDummyReportData();
        
        return (
            <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>📊 Financial Report Preview</h2>
                        <button className="close-btn" onClick={() => setShowReportModal(false)}>×</button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="report-summary">
                            <div className="report-date">
                                <strong>Report Generated:</strong> {data.reportDate}
                            </div>
                            
                            <div className="summary-grid">
                                <div className="summary-section">
                                    <h3>📈 Membership Overview</h3>
                                    <div className="summary-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Members:</span>
                                            <span className="stat-value">{data.summary.totalMembers.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Active Members:</span>
                                            <span className="stat-value success">{data.summary.activeMembers.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">New This Month:</span>
                                            <span className="stat-value info">{data.summary.newMembersThisMonth}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="summary-section">
                                    <h3>💰 Financial Overview</h3>
                                    <div className="summary-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Savings:</span>
                                            <span className="stat-value">₱{data.financials.totalSavings.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Loan Balances:</span>
                                            <span className="stat-value">₱{data.financials.totalLoanBalances.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Loan Profits:</span>
                                            <span className="stat-value success">₱{data.financials.totalProfitFromLoans.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="loan-profit-section">
                                <h3>🏦 Loan Profit Breakdown</h3>
                                <div className="profit-grid">
                                    {Object.entries(data.loanProfitBreakdown).map(([type, details]) => (
                                        <div key={type} className="profit-card">
                                            <h4>{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                                            <div className="profit-details">
                                                <span>Total: ₱{details.totalAmount.toLocaleString()}</span>
                                                <span className="profit-earned">Profit: ₱{details.interestEarned.toLocaleString()}</span>
                                                <span className="interest-rate">{details.avgInterestRate}% avg rate</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="member-preview">
                                <h3>👥 Top 5 Member Balances</h3>
                                <div className="member-list">
                                    {data.memberBalances.slice(0, 5).map(member => (
                                        <div key={member.id} className="member-item">
                                            <div className="member-info">
                                                <strong>{member.name}</strong> ({member.id})
                                            </div>
                                            <div className="member-balances">
                                                <span>Savings: ₱{member.savings.toLocaleString()}</span>
                                                <span>Loan: ₱{member.loanBalance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                            Close Preview
                        </button>
                        <button className="btn btn-success" onClick={() => downloadReport('csv')}>
                            📄 Download CSV
                        </button>
                        <button className="btn btn-primary" onClick={() => downloadReport('pdf')}>
                            📋 Download PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Manager Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome, {userInfo?.name || 'Manager'}! Oversee operations and drive growth.
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">💹</div>
                    <div className="stat-info">
                        <h3>Monthly Revenue</h3>
                        <span className="stat-number">₱{stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Total Members</h3>
                        <span className="stat-number">{stats.totalMembers}</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <h3>Loan Applications</h3>
                        <span className="stat-number">{stats.activeLoanApplications}</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>Staff Performance</h3>
                        <span className="stat-number">{stats.staffPerformance}%</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>Management Tools</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">
                            <span className="btn-icon">👥</span>
                            Staff Management
                        </button>
                        <button className="action-btn success">
                            <span className="btn-icon">📈</span>
                            Performance Reports
                        </button>
                        <button className="action-btn warning">
                            <span className="btn-icon">💰</span>
                            Loan Approvals
                        </button>
                        <button 
                            className="action-btn info" 
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                        >
                            <span className="btn-icon">
                                {isGeneratingReport ? '⏳' : '📊'}
                            </span>
                            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Key Metrics</h2>
                    <div className="quick-actions">
                        <div className="quick-action-item">
                            <span className="action-icon">📊</span>
                            <div className="action-content">
                                <h4>Monthly Report</h4>
                                <p>View detailed analytics</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">💼</span>
                            <div className="action-content">
                                <h4>Portfolio Overview</h4>
                                <p>Loan portfolio status</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">🎯</span>
                            <div className="action-content">
                                <h4>Target Progress</h4>
                                <p>Track monthly goals</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Pending Approvals</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">Priority</span>
                            <span className="activity-desc">Loan Application - ₱500,000 - Review Required</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Medium</span>
                            <span className="activity-desc">Staff Leave Request - John Doe - 3 days</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Low</span>
                            <span className="activity-desc">Equipment Purchase - Office Supplies</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && <ReportModal />}
        </div>
    );
};

export default ManagerDashboard;
