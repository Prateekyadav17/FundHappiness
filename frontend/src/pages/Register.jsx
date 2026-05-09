import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialRole) {
      navigate('/join');
    }
  }, [initialRole, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  // Sync role if query param changes
  useEffect(() => {
    if (queryParams.get('role')) {
      setRole(queryParams.get('role'));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await register(name, email, password, role);
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
        <title>Sign Up | FundHappiness</title>
        <meta name="description" content="Create a FundHappiness account to start crowdfunding." />
      </Helmet>
      
      <div className="auth-container glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto' }} />
        </div>
        <h2 style={{ textAlign: 'center' }}>Create an Account</h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>I am a...</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="donor" 
                  checked={role === 'donor'} 
                  onChange={(e) => setRole(e.target.value)}
                />
                Individual Donor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="organization" 
                  checked={role === 'organization'} 
                  onChange={(e) => setRole(e.target.value)}
                />
                NGO / Organization
              </label>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Log In</Link>
        </div>
      </div>
    </>
  );
};

export default Register;
