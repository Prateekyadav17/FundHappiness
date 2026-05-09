import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Log In | FundHappiness</title>
        <meta name="description" content="Log in to your FundHappiness account to support campaigns or create your own." />
      </Helmet>
      
      <div className="auth-container glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto' }} />
        </div>
        <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-10px' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/join" style={{ color: 'var(--primary-color)' }}>Sign Up</Link>
        </div>
      </div>
    </>
  );
};

export default Login;
