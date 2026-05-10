import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ campaigns: [], organizations: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const [campRes, orgRes] = await Promise.all([
            axios.get('https://fundhappiness.onrender.com/api/campaigns'),
            axios.get('https://fundhappiness.onrender.com/api/organizations')
          ]);
          
          const query = searchQuery.toLowerCase();
          const filteredCamps = campRes.data.filter(c => 
            c.title.toLowerCase().includes(query)
          ).slice(0, 3);
          
          const filteredOrgs = orgRes.data.filter(o => 
            o.name.toLowerCase().includes(query)
          ).slice(0, 3);

          setSearchResults({ campaigns: filteredCamps, organizations: filteredOrgs });
          setShowDropdown(true);
        } catch (error) {
          console.error('Live search error', error);
        }
      } else {
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
            <span>FundHappiness</span>
          </Link>
        </div>
        
        <div className="desktop-search" style={{ flexGrow: 1, maxWidth: '400px', position: 'relative' }} ref={dropdownRef}>
          <form onSubmit={handleSearch} style={{ display: 'flex' }}>
            <input 
              type="text" 
              placeholder="Search initiatives..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="form-control"
              style={{ 
                padding: '10px 20px', 
                borderRadius: '25px', 
                border: 'none', 
                background: 'rgba(255,255,255,0.9)', 
                color: '#333',
                width: '100%',
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
            />
          </form>

          {showDropdown && (searchQuery.trim()) && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              background: 'white', 
              marginTop: '10px', 
              borderRadius: '15px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              animation: 'fadeInUp 0.2s ease-out',
              padding: '10px 0'
            }}>
              {searchResults.campaigns.length === 0 && searchResults.organizations.length === 0 ? (
                <div style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.9rem' }}>No matches found</div>
              ) : (
                <>
                  {searchResults.campaigns.length > 0 && (
                    <div>
                      <div style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Campaigns</div>
                      {searchResults.campaigns.map(c => (
                        <Link 
                          key={c._id} 
                          to={`/campaign/${c._id}`} 
                          onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', textDecoration: 'none', color: '#1e293b' }}
                          className="search-item"
                        >
                          <img src={c.image} style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.organizations.length > 0 && (
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '5px', paddingTop: '5px' }}>
                      <div style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Organizations</div>
                      {searchResults.organizations.map(o => (
                        <Link 
                          key={o._id} 
                          to={`/organization/${o._id}`} 
                          onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', textDecoration: 'none', color: '#1e293b' }}
                          className="search-item"
                        >
                          <img src={o.image} style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{o.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="nav-links desktop-menu">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/explore-ngos">Organizations</Link>
          <Link to="/search">Campaigns</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={{ fontWeight: 'bold' }}>Dashboard</Link>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Hi, {user.name.split(' ')[0]}</div>
              <button onClick={handleLogout} className="btn" style={{ padding: '6px 15px', fontSize: '0.9rem', background: '#ffffff', color: 'var(--primary-color)', fontWeight: '700' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn" style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #ffffff', color: '#ffffff' }}>Log In</Link>
              <Link to="/join" className="btn" style={{ padding: '6px 16px', background: '#ffffff', color: 'var(--primary-color)', fontWeight: '700' }}>Sign Up</Link>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={toggleTheme} className="theme-toggle mobile-theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/explore-ngos" onClick={() => setIsMobileMenuOpen(false)}>Organizations</Link>
        <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>Campaigns</Link>
        {user ? (
          <>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Dashboard</Link>
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <Link to="/login" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)} style={{ textAlign: 'center' }}>Log In</Link>
            <Link to="/join" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)} style={{ textAlign: 'center' }}>Sign Up</Link>
          </div>
        )}
      </div>
      <style>
        {`
          .search-item:hover {
            background: #f8fafc;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
