import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, { password });
      alert('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '100px', maxWidth: '400px' }}>
      <Helmet>
        <title>Reset Password | FundHappiness</title>
      </Helmet>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Please enter your new password below.
        </p>

        {error && (
          <div style={{ background: 'rgba(255, 82, 82, 0.1)', color: '#ff5252', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              style={{ padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              style={{ padding: '12px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontWeight: '700', borderRadius: '12px' }}
          >
            {loading ? 'RESETTING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
