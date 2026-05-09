import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--footer-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 0 20px 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <img src="/logo-green.png" alt="Logo" style={{ height: '38px', width: 'auto' }} />
              <h3 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', margin: 0 }}>FundHappiness</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Empowering communities and social workers by connecting them with a global network of passionate donors.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/explore-ngos" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Explore NGOs</Link></li>
              <li><Link to="/search" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Search Campaigns</Link></li>
              <li><Link to="/create-organization" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Register an NGO</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Legal & Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terms of Service</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Help Center</a></li>
            </ul>
          </div>

        </div>

        <div style={{ 
          textAlign: 'center', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          &copy; {new Date().getFullYear()} FundHappiness. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
