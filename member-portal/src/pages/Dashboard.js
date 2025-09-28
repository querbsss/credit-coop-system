import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './Dashboard.css';

const Dashboard = () => {
  const { user, refreshUserSummary } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('memberPortalToken') : null;
  const [showHistory, setShowHistory] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [history, setHistory] = useState({ loading: false, items: [], error: null });
  const [txForm, setTxForm] = useState({ account: 'savings', type: 'credit', amount: '', description: '' });
  const accountsOptions = useMemo(() => {
    const opts = [];
    if (user?.accounts?.savings) opts.push({ key: 'savings', label: `Savings • ${user?.accounts?.savings?.accountNumber}` });
    if (user?.accounts?.checking) opts.push({ key: 'checking', label: `Checking • ${user?.accounts?.checking?.accountNumber}` });
    return opts;
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openHistory = async () => {
    if (!token) return setShowHistory(true);
    setHistory(h => ({ ...h, loading: true, error: null }));
    try {
      const res = await fetch('/transactions?limit=50', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory({ loading: false, items: data.transactions || [], error: null });
    } catch (e) {
      setHistory({ loading: false, items: [], error: e.message || 'Failed to load history' });
    }
    setShowHistory(true);
  };

  const quickActions = [
    { icon: 'money', label: 'Add Money', color: 'success', onClick: () => { setTxForm({ account: 'savings', type: 'credit', amount: '', description: 'Deposit' }); setShowTransfer(true); } },
    { icon: 'savings', label: 'Savings', color: 'info', onClick: () => { setTxForm({ account: 'savings', type: 'debit', amount: '', description: 'Transfer to Savings' }); setShowTransfer(true); } },
    { icon: 'send', label: 'Pay Bills', color: 'warning', onClick: () => { setTxForm({ account: 'checking', type: 'debit', amount: '', description: 'Bill Payment' }); setShowTransfer(true); } },
    { icon: 'clock', label: 'History', color: 'secondary', onClick: () => openHistory() }
  ];

  const submitTransaction = async (e) => {
    e?.preventDefault?.();
    if (!token) return;
    const payload = {
      account: txForm.account,
      type: txForm.type,
      amount: Number(txForm.amount),
      description: txForm.description || (txForm.type === 'credit' ? 'Deposit' : 'Payment')
    };
    if (!payload.amount || payload.amount <= 0) return alert('Enter a valid amount');
    try {
      const res = await fetch('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      // Refresh user summary to update balances and recent transactions
      await refreshUserSummary();
      setShowTransfer(false);
      setTxForm({ account: 'savings', type: 'credit', amount: '', description: '' });
    } catch (err) {
      alert(err.message || 'Transaction failed');
    }
  };

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-card card">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h1>Welcome back, {user?.firstName} {user?.lastName}</h1>
                  <span className="status-badge status-active">ACTIVE</span>
                </div>
                <div className="member-avatar">
                  <div className="avatar-circle-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Overview */}
          <div className="accounts-section">
            <div className="grid grid-2">
              {/* Savings Account */}
              <div className="account-card card">
                <div className="account-header">
                  <div className="account-icon savings"><Icon name="savings" size={24} color="var(--primary-blue)" /></div>
                  <div className="account-info">
                    <h3>Total Savings</h3>
                    <p className="account-number">{user?.accounts?.savings?.accountNumber}</p>
                  </div>
                  <div className="account-action">
                    <button className="btn-icon">➤</button>
                  </div>
                </div>
                <div className="account-balance">
                  <span className="balance-amount">{formatCurrency(user?.accounts?.savings?.balance)}</span>
                  <span className="balance-label">Current balance</span>
                </div>
              </div>

              {/* Checking Account */}
              <div className="account-card card">
                <div className="account-header">
                  <div className="account-icon checking"><Icon name="creditCard" size={24} color="var(--primary-blue)" /></div>
                  <div className="account-info">
                    <h3>Checking</h3>
                    <p className="account-number">{user?.accounts?.checking?.accountNumber}</p>
                  </div>
                  <div className="account-action">
                    <button className="btn-icon">➤</button>
                  </div>
                </div>
                <div className="account-balance">
                  <span className="balance-amount">{formatCurrency(user?.accounts?.checking?.balance)}</span>
                  <span className="balance-label">Available balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Section */}
          <div className="loan-section">
            <div className="loan-card card">
              <div className="loan-header">
                <div className="loan-icon">🏦</div>
                <div className="loan-info">
                  <h3>Loan Balance</h3>
                  <p>Auto Loan - Next payment due {formatDate(user?.loans?.[0]?.nextPayment)}</p>
                </div>
              </div>
              <div className="loan-balance">
                <span className="balance-amount">{formatCurrency(user?.loans?.[0]?.currentBalance)}</span>
                <span className="balance-label">Current balance</span>
              </div>
              <div className="loan-action">
                <button className="btn btn-primary btn-lg">
                  🏷️ Need funds?<br />
                  <span>Apply for a loan now!</span><br />
                  <small>Starting from ₱500,000</small>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="quick-actions-card card">
              <h3><Icon name="zap" size={20} /> Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button key={index} className={`quick-action-btn ${action.color}`} onClick={action.onClick}>
                    <span className="action-icon"><Icon name={action.icon} size={20} /></span>
                    <span className="action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <div className="activity-header">
              <h3><Icon name="clock" size={20} /> Recent Activity</h3>
              <button type="button" className="view-all-link" onClick={openHistory} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            
            <div className="activity-list">
              {user?.recentTransactions?.slice(0, 4).map((transaction) => (
                <div key={transaction.id} className="activity-item card">
                  <div className="activity-icon">
                    {transaction.type === 'credit' ? <Icon name="money" size={20} color="var(--accent-green)" /> : 
                     transaction.type === 'transfer' ? <Icon name="transfer" size={20} color="var(--primary-blue)" /> : <Icon name="send" size={20} color="var(--accent-red)" />}
                  </div>
                  <div className="activity-info">
                    <h4>{transaction.description}</h4>
                    <p>{formatDate(transaction.date)} • {transaction.account}</p>
                  </div>
                  <div className={`activity-amount ${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : ''}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-transaction">
              <button className="btn btn-primary btn-lg" onClick={() => { setTxForm({ account: 'savings', type: 'credit', amount: '', description: 'Deposit' }); setShowTransfer(true); }}>
                ➕ Add Transaction
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* History Modal */}
      <Modal open={showHistory} title="Transaction History" onClose={() => setShowHistory(false)}>
        {history.loading && <p>Loading...</p>}
        {history.error && <p style={{ color: 'var(--accent-red)' }}>{history.error}</p>}
        {!history.loading && !history.error && (
          <div className="activity-list">
            {(history.items.length ? history.items : (user?.recentTransactions || [])).map((t) => (
              <div key={t.id} className="activity-item card">
                <div className="activity-icon">
                  {t.type === 'credit' ? <Icon name="money" size={20} color="var(--accent-green)" /> : 
                   t.type === 'transfer' ? <Icon name="transfer" size={20} color="var(--primary-blue)" /> : <Icon name="send" size={20} color="var(--accent-red)" />}
                </div>
                <div className="activity-info">
                  <h4>{t.description}</h4>
                  <p>{formatDate(t.date)} • {t.account}</p>
                </div>
                <div className={`activity-amount ${t.type}`}>
                  {t.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Add Money / Pay Bills Modal */}
      <Modal
        open={showTransfer}
        title={txForm.type === 'credit' ? 'Add Money' : 'Pay / Transfer'}
        onClose={() => setShowTransfer(false)}
        actions={(
          <>
            <button className="modal-btn ghost" onClick={() => setShowTransfer(false)}>Cancel</button>
            <button className="modal-btn primary" onClick={submitTransaction}>Submit</button>
          </>
        )}
      >
        <form onSubmit={submitTransaction} className="form-grid">
          <div className="form-row">
            <label>Account</label>
            <select value={txForm.account} onChange={(e) => setTxForm({ ...txForm, account: e.target.value })}>
              {accountsOptions.map(o => (<option key={o.key} value={o.key}>{o.label}</option>))}
            </select>
          </div>
          <div className="form-row">
            <label>Type</label>
            <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}>
              <option value="credit">Credit (Add)</option>
              <option value="debit">Debit (Pay)</option>
            </select>
          </div>
          <div className="form-row">
            <label>Amount</label>
            <input type="number" min="0" step="0.01" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div className="form-row">
            <label>Description</label>
            <input type="text" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder="Description" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
