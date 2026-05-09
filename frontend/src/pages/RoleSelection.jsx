import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <Helmet>
        <title>Join Us | FundHappiness</title>
      </Helmet>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>
          How would you like to <span style={{ color: 'var(--primary-color)' }}>Join Us</span>?
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
          Choose your path to make a difference in the community.
        </p>
      </div>

      <div className="responsive-grid-2col" style={{ 
        width: '100%', 
        maxWidth: '900px' 
      }}>
        {/* Donor Card */}
        <div 
          onClick={() => handleSelectRole('donor')}
          className="glass-panel" 
          style={{ 
            padding: '50px 30px', 
            textAlign: 'center', 
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(76, 175, 80, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            fontSize: '3rem'
          }}>
            ❤️
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b' }}>I am a Donor</h2>
          <p style={{ color: '#64748b', lineHeight: '1.6' }}>
            I want to explore social initiatives, support verified campaigns, and track my impact.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Start Donating
          </button>
        </div>

        {/* Organization Card */}
        <div 
          onClick={() => handleSelectRole('organization')}
          className="glass-panel" 
          style={{ 
            padding: '50px 30px', 
            textAlign: 'center', 
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(76, 175, 80, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            fontSize: '3rem'
          }}>
            🏢
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b' }}>I am an NGO</h2>
          <p style={{ color: '#64748b', lineHeight: '1.6' }}>
            I want to register my organization, launch campaigns, and raise funds for social causes.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Register Organization
          </button>
        </div>
      </div>

      <p style={{ marginTop: '40px', color: '#64748b' }}>
        Already have an account? <span 
          onClick={() => navigate('/login')} 
          style={{ color: 'var(--primary-color)', fontWeight: '700', cursor: 'pointer' }}
        >
          Log In
        </span>
      </p>
    </div>
  );
};

export default RoleSelection;
