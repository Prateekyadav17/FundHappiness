import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Loading from '../components/Loading';

const ExploreNGOs = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get('https://fundhappiness.onrender.com/api/organizations');
        setOrganizations(res.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  return (
    <>
      <Helmet>
        <title>Explore NGOs | FundHappiness</title>
        <meta name="description" content="Discover NGOs and social organizations making a difference." />
      </Helmet>

      <section className="container" style={{ marginTop: '60px', marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Explore Organizations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Find and join communities dedicated to social good.</p>
        </div>
        
        {loading ? (
          <Loading />
        ) : organizations.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No organizations found. Be the first to register one!</p>
        ) : (
          <div className="campaign-grid">
            {organizations.map((org) => (
              <Link to={`/organization/${org._id}`} key={org._id}>
                <div className="campaign-card glass-panel" style={{ height: '100%' }}>
                  <img src={org.image || '/images/default-org.png'} alt={org.name} className="campaign-image" />
                  <div className="campaign-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className="campaign-title">{org.name}</h3>
                    <p className="campaign-desc" style={{ flexGrow: 1 }}>{org.mission}</p>
                    
                    <div className="campaign-stats" style={{ marginTop: '15px' }}>
                      <span>{org.members?.length || 0} Members</span>
                      <span style={{ color: 'var(--primary-color)' }}>View Community &rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default ExploreNGOs;
