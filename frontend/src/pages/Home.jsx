import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Loading from '../components/Loading';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1529156069898-49953eb1f5bc?w=1920&fit=crop&q=60&auto=format',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&fit=crop&q=60&auto=format',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&fit=crop&q=60&auto=format',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&fit=crop&q=60&auto=format',
    'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=1920&fit=crop&q=60&auto=format'
  ];

  useEffect(() => {
    // Preload the first image for instant display
    const img = new Image();
    img.src = heroImages[0];

    const fetchData = async () => {
      try {
        const [campRes, orgRes] = await Promise.all([
          axios.get('https://fundhappiness.onrender.com/api/campaigns'),
          axios.get('https://fundhappiness.onrender.com/api/organizations')
        ]);
        setCampaigns(campRes.data.slice(0, 3));
        setOrganizations(orgRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>FundHappiness | A donation platform</title>
        <meta name="description" content="Discover and support innovative campaigns and NGOs on FundHappiness." />
        <link rel="preload" as="image" href={heroImages[0]} />
      </Helmet>

      {/* Hero Section */}
      <section className="hero">
        {heroImages.map((img, index) => (
          <div 
            key={index}
            className={`hero-bg ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-overlay"></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1>Empower Communities. Fund the Future.</h1>
          <p>Join a network of NGOs and social workers. Support causes you care about.</p>
          <Link to="/explore-ngos" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
            Explore Organizations
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="info-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>How FundHappiness Works</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Connecting passionate donors with transparent, impactful organizations.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=150&q=80" alt="Discover" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid var(--primary-color)' }} />
              <h3>1. Discover organizations</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Browse through hundreds of verified organizations and find a cause that speaks to you.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=150&q=80" alt="Community" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid var(--primary-color)' }} />
              <h3>2. Join the Community</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Become a member of an NGO to receive updates and show your long-term support.</p>
            </div>
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&q=80" alt="Fund" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid var(--primary-color)' }} />
              <h3>3. Fund Campaigns</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Directly fund specific projects and watch the progress bar fill up as the community rallies together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Campaigns Section */}
      <section className="container" style={{ padding: '60px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '2rem' }}>Trending Campaigns</h2>
          <Link to="/search" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>View All Campaigns &rarr;</Link>
        </div>
        
        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => {
              const progressPercentage = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
              
              return (
                <Link to={`/campaign/${campaign._id}`} key={campaign._id}>
                  <div className="campaign-card glass-panel">
                    <img src={campaign.image} alt={campaign.title} className="campaign-image" />
                    <div className="campaign-content">
                      <h3 className="campaign-title">{campaign.title}</h3>
                      <p className="campaign-desc">{campaign.description}</p>
                      
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                      
                      <div className="campaign-stats">
                        <span>₹{campaign.raisedAmount.toLocaleString()} raised</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trending Organizations Section */}
      <section className="container" style={{ padding: '60px 20px', background: 'rgba(76, 175, 80, 0.03)', borderRadius: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '2rem' }}>Verified Organizations</h2>
          <Link to="/explore-ngos" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Explore All &rarr;</Link>
        </div>
        
        {loading ? (
          <p>Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p>No organizations found.</p>
        ) : (
          <div className="campaign-grid">
            {organizations.map((org) => (
              <Link to={`/organization/${org._id}`} key={org._id}>
                <div className="campaign-card glass-panel" style={{ height: '100%' }}>
                  <img src={org.image} alt={org.name} className="campaign-image" />
                  <div className="campaign-content">
                    <h3 className="campaign-title">{org.name}</h3>
                    <p className="campaign-desc">{org.mission}</p>
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

      {/* Impact Photo Section */}
      <section className="info-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Our Collective Impact</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Real results from our global community.</p>
          
          <div className="mobile-slider">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" alt="Volunteers" className="impact-img" />
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80" alt="Happy community" className="impact-img" />
            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80" alt="Hands joined" className="impact-img" />
            <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80" alt="Community work" className="impact-img" />
            <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" alt="Helping hands" className="impact-img" />
            <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80" alt="Togetherness" className="impact-img" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
