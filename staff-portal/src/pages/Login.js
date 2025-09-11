import React, { Fragment, useState } from 'react';
import './Login.css';

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { email, password } = inputs;

  const onChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setError('');
  }

  const onSubmitForm = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const body = { email, password };
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();
      
      if (response.ok) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
      } else {
        setError(parseRes.error || 'Login failed');
      }
    } catch (err) {
      console.error(err.message);
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">⚛️</div>
            <div className="logo-text">
              <h1>CreditCoop</h1>
              <span className="logo-subtitle">Staff Portal</span>
            </div>
          </div>
        </div>

        <form className="login-form" onSubmit={onSubmitForm}>
          <h2>Staff Login</h2>
          <p className="login-description">Access the Credit Cooperative management system</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;
