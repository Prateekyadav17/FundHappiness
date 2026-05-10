import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Loading from '../components/Loading';

const Search = () => {
  const [results, setResults] = useState({ campaigns: [], organizations: [] });
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [campRes, orgRes] = await Promise.all([
          axios.get('https://fundhappiness.onrender.com/api/campaigns'),
          axios.get('https://fundhappiness.onrender.com/api/organizations')
        ]);
        
        if (query) {
          const lowerQuery = query.toLowerCase().trim();
          const words = lowerQuery.split(/\s+/);
          
          const filteredCamps = campRes.data.filter(c => {
            const searchStr = `${c.title} ${c.description} ${c.category}`.toLowerCase();
            return words.every(word => searchStr.includes(word));
          });
          
          const filteredOrgs = orgRes.data.filter(o => {
            const searchStr = `${o.name} ${o.mission}`.toLowerCase();
            return words.every(word => searchStr.includes(word));
          });

          setResults({ campaigns: filteredCamps, organizations: filteredOrgs });
        } else {
          setResults({ campaigns: campRes.data, organizations: orgRes.data });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  const hasResults = results.campaigns.length > 0 || results.organizations.length > 0;

  return (
    <>
      <Helmet>
        <title>Search Initiatives | FundHappiness</title>
        <meta name="description" content="Find campaigns and NGOs making an impact." />
      </Helmet>

      <section className="container" style={{ marginTop: '60px', marginBottom: '80px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            {query ? `Search Results for "${query}"` : 'All Initiatives'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Found {results.campaigns.length} campaigns and {results.organizations.length} organizations.
          </p>
        </div>
        
        {loading ? (
          <Loading />
        ) : !hasResults ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>No matches found</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We couldn't find anything matching your search. Try different keywords.</p>
            <Link to="/explore-ngos" className="btn btn-primary" style={{ marginTop: '30px', padding: '12px 30px' }}>Explore All Organizations</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {results.organizations.length > 0 && (
              <div>
                <h2 className="section-title">Verified Organizations</h2>
                <div className="campaign-grid">
                  {results.organizations.map((org) => (
                    <Link to={`/organization/${org._id}`} key={org._id}>
                      <div className="campaign-card glass-panel" style={{ height: '100%' }}>
                        <img src={org.image} alt={org.name} className="campaign-image" />
                        <div className="campaign-content">
                          <h3 className="campaign-title">{org.name}</h3>
                          <p className="campaign-desc" style={{ WebkitLineClamp: '2' }}>{org.mission}</p>
                          <div className="campaign-stats" style={{ marginTop: '15px' }}>
                            <span>{org.members?.length || 0} Members</span>
                            <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>View Profile &rarr;</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.campaigns.length > 0 && (
              <div>
                <h2 className="section-title">Active Campaigns</h2>
                <div className="campaign-grid">
                  {results.campaigns.map((campaign) => {
                    const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
                    return (
                      <Link to={`/campaign/${campaign._id}`} key={campaign._id}>
                        <div className="campaign-card glass-panel">
                          <img src={campaign.image} alt={campaign.title} className="campaign-image" />
                          <div className="campaign-content">
                            <h3 className="campaign-title">{campaign.title}</h3>
                            <p className="campaign-desc" style={{ WebkitLineClamp: '2' }}>{campaign.description}</p>
                            <div className="progress-container">
                              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="campaign-stats">
                              <span>₹{campaign.raisedAmount.toLocaleString()} raised</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Search;
