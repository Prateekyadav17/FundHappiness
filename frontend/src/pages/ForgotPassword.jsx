import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '100px', maxWidth: '400px' }}>
      <Helmet>
        <title>Forgot Password | FundHappiness</title>
      </Helmet>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Forgot Password</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-color)', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255, 82, 82, 0.1)', color: '#ff5252', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontWeight: '700', borderRadius: '12px' }}
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
