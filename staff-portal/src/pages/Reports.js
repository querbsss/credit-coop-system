import React, { useState } from 'react';
import './Dashboard.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [showReports, setShowReports] = useState(false);

  // Dummy member data from Members.js
  const members = [
    {
      id: 'MEM001',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@email.com',
      phone: '+63 912 345 6789',
      memberSince: '2020-03-15',
      status: 'active',
      totalDeposits: 125000,
      loanBalance: 45000
    },
    {
      id: 'MEM002',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 917 765 4321',
      memberSince: '2019-11-22',
      status: 'active',
      totalDeposits: 89500,
      loanBalance: 0
    },
    {
      id: 'MEM003',
      name: 'Pedro Garcia',
      email: 'pedro.garcia@email.com',
      phone: '+63 922 111 2233',
      memberSince: '2021-07-08',
      status: 'inactive',
      totalDeposits: 15000,
      loanBalance: 25000
    },
    {
      id: 'MEM004',
      name: 'Ana Rodriguez',
      email: 'ana.rodriguez@email.com',
      phone: '+63 918 444 5566',
      memberSince: '2022-01-12',
      status: 'active',
      totalDeposits: 67800,
      loanBalance: 12000
    }
  ];

        // Calculate financial metrics
        const financialData = {
          totalDeposits: members.reduce((sum, m) => sum + m.totalDeposits, 0),
          totalLoans: members.reduce((sum, m) => sum + m.loanBalance, 0),
          activeMembers: members.filter(m => m.status === 'active').length,
          inactiveMembers: members.filter(m => m.status === 'inactive').length,
          avgDeposit: members.reduce((sum, m) => sum + m.totalDeposits, 0) / members.length,
          membersByYear: {}
        };

        // Group members by year
        members.forEach(member => {
          const year = new Date(member.memberSince).getFullYear();
          financialData.membersByYear[year] = (financialData.membersByYear[year] || 0) + 1;
        });

        const handleGenerateReport = () => {
          setShowReports(!showReports);
        };

        const BarChart = ({ data, label }) => {
          const maxValue = Math.max(...Object.values(data));
    
          return (
            <div className="bar-chart">
              <h4 className="chart-title">{label}</h4>
              <div className="chart-container">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="bar-group">
                    <div className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${(value / maxValue) * 100}%`,
                          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                        }}
                      >
                        <span className="bar-value">{value}</span>
                      </div>
                    </div>
                    <span className="bar-label">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        };

        const FinancialReportSection = () => {
          const depositsData = {};
          const loansData = {};
    
          members.forEach(member => {
            depositsData[member.name.split(' ')[0]] = member.totalDeposits / 1000; // in thousands
            loansData[member.name.split(' ')[0]] = member.loanBalance / 1000; // in thousands
          });

          // Export current report to PDF using jsPDF + autoTable
          const exportPdf = () => {
            try {
              const doc = new jsPDF({ unit: 'pt', format: 'a4' });
              doc.setFontSize(16);
              doc.text('Financial Report', 40, 48);

              doc.setFontSize(10);
              const yStart = 68;
              doc.text(`Total Deposits: ₱${financialData.totalDeposits.toLocaleString()}`, 40, yStart);
              doc.text(`Total Loan Balance: ₱${financialData.totalLoans.toLocaleString()}`, 300, yStart);
              doc.text(`Active Members: ${financialData.activeMembers}`, 40, yStart + 16);
              doc.text(`Average Deposit: ₱${Math.round(financialData.avgDeposit).toLocaleString()}`, 300, yStart + 16);

              // table headers and rows
              const headers = ['Member ID','Name','Status','Member Since','Total Deposits','Loan Balance','Net Position'];
              const rows = members.map(m => [
                m.id,
                m.name,
                m.status,
                new Date(m.memberSince).toLocaleDateString(),
                `₱${m.totalDeposits.toLocaleString()}`,
                `₱${m.loanBalance.toLocaleString()}`,
                `₱${(m.totalDeposits - m.loanBalance).toLocaleString()}`
              ]);

              doc.autoTable({
                startY: yStart + 36,
                head: [headers],
                body: rows,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [124,58,237], textColor: 255 },
                margin: { left: 40, right: 40 }
              });

              const fileName = `financial_report_${new Date().toISOString().slice(0,10)}.pdf`;
              doc.save(fileName);
            } catch (err) {
              console.error('Export PDF failed', err);
              alert('Unable to export PDF. See console for details.');
            }
          };

          return (
            <div className="financial-reports-container">
              <div className="report-summary-cards">
                <div className="report-card blue">
                  <div className="report-icon">💰</div>
                  <div className="report-content">
                    <h4>Total Deposits</h4>
                    <span className="report-value">₱{financialData.totalDeposits.toLocaleString()}</span>
                    <p className="report-description">All member deposits</p>
                  </div>
                </div>
                <div className="report-card orange">
                  <div className="report-icon">📋</div>
                  <div className="report-content">
                    <h4>Total Loan Balance</h4>
                    <span className="report-value">₱{financialData.totalLoans.toLocaleString()}</span>
                    <p className="report-description">Outstanding loans</p>
                  </div>
                </div>
                <div className="report-card green">
                  <div className="report-icon">👥</div>
                  <div className="report-content">
                    <h4>Active Members</h4>
                    <span className="report-value">{financialData.activeMembers}</span>
                    <p className="report-description">Currently active</p>
                  </div>
                </div>
                <div className="report-card purple">
                  <div className="report-icon">📈</div>
                  <div className="report-content">
                    <h4>Average Deposit</h4>
                    <span className="report-value">₱{Math.round(financialData.avgDeposit).toLocaleString()}</span>
                    <p className="report-description">Per member</p>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <BarChart data={depositsData} label="Member Deposits (in ₱1000s)" />
                  <div className="chart-footer">
                    <p>💡 Total deposits across all members</p>
                  </div>
                </div>
                <div className="chart-card">
                  <BarChart data={loansData} label="Member Loan Balances (in ₱1000s)" />
                  <div className="chart-footer">
                    <p>💡 Outstanding loan amounts per member</p>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <BarChart data={financialData.membersByYear} label="Member Growth by Year" />
                  <div className="chart-footer">
                    <p>💡 New members registered each year</p>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="member-status-chart">
                    <h4 className="chart-title">Member Status Distribution</h4>
                    <div className="status-bars">
                      <div className="status-bar-item">
                        <div className="status-label">
                          <span className="status-dot active"></span>
                          <span>Active Members</span>
                        </div>
                        <div className="status-bar-container">
                          <div 
                            className="status-bar active-bar"
                            style={{ width: `${(financialData.activeMembers / members.length) * 100}%` }}
                          >
                            <span className="status-count">{financialData.activeMembers}</span>
                          </div>
                        </div>
                      </div>
                      <div className="status-bar-item">
                        <div className="status-label">
                          <span className="status-dot inactive"></span>
                          <span>Inactive Members</span>
                        </div>
                        <div className="status-bar-container">
                          <div 
                            className="status-bar inactive-bar"
                            style={{ width: `${(financialData.inactiveMembers / members.length) * 100}%` }}
                          >
                            <span className="status-count">{financialData.inactiveMembers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chart-footer">
                    <p>💡 Active vs Inactive member ratio</p>
                  </div>
                </div>
              </div>

              <div className="member-details-table">
                <h3>📋 Detailed Member Financial Report</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Member Since</th>
                      <th>Total Deposits</th>
                      <th>Loan Balance</th>
                      <th>Net Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td><span className="member-id">{member.id}</span></td>
                        <td>
                          <div className="member-info">
                            <div className="member-avatar small">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="member-name">{member.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${member.status}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>{new Date(member.memberSince).toLocaleDateString()}</td>
                        <td className="text-success font-weight-bold">
                          ₱{member.totalDeposits.toLocaleString()}
                        </td>
                        <td className="text-warning font-weight-bold">
                          ₱{member.loanBalance.toLocaleString()}
                        </td>
                        <td className={member.totalDeposits - member.loanBalance >= 0 ? 'text-success' : 'text-danger'}>
                          <strong>₱{(member.totalDeposits - member.loanBalance).toLocaleString()}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="report-actions">
                <button className="btn btn-primary" onClick={() => exportPdf()}>
                  <span>📄</span>
                  Export as PDF
                </button>
                <button className="btn btn-success">
                  <span>📊</span>
                  Export as Excel
                </button>
                <button className="btn btn-info">
                  <span>📧</span>
                  Email Report
                </button>
              </div>
            </div>
          );
        };
        return (
          <div className="page">
            <div className="page-header">
              <div className="page-title">
                <h1>Financial Reports</h1>
                <p>Generate and view financial reports and analytics</p>
              </div>
              <button className="btn btn-primary" onClick={handleGenerateReport}>
                <span>📈</span>
                {showReports ? 'Hide Report' : 'Generate Report'}
              </button>
            </div>
      
            {showReports ? (
              <FinancialReportSection />
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
                <h3>No report generated yet.</h3>
                <p>Click "Generate Report" to view financial analytics.</p>
              </div>
            )}
          </div>
        );
      };

export default Reports;
