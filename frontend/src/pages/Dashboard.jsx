import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for AuthContext to finish reading from localStorage
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        if (user.role === 'organization') {
          const res = await axios.get('https://fundhappiness.onrender.com/api/organizations/my/org', config);
          setData(res.data);
        } else {
          const res = await axios.get('https://fundhappiness.onrender.com/api/donations/my/donations', config);
          setData(res.data);

          // Fetch followed organizations
          const profileRes = await axios.get('https://fundhappiness.onrender.com/api/auth/me', config);
          setFollowing(profileRes.data.following || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate, authLoading]);

  if (authLoading || loading) return <Loading />;

  const isOrg = user?.role === 'organization';

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      <Helmet>
        <title>Dashboard | FundHappiness</title>
      </Helmet>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>Welcome back, {user?.name}!</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isOrg ? 'Manage your initiative and campaigns.' : 'Track your impact and donations.'}
        </p>
      </div>

      {isOrg ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {!data ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <h3>You haven't registered your initiative yet!</h3>
              <p style={{ marginBottom: '20px' }}>Start your journey by creating an initiative profile.</p>
              <Link to="/create-organization" className="btn btn-primary">Register Initiative</Link>
            </div>
          ) : (
            <>
              <div className="responsive-grid-2col" style={{ marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <img
                    src={data.organization.image}
                    alt={data.organization.name}
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <div>
                    <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>{data.organization.name}</h2>
                    <p style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{data.organization.mission.substring(0, 100)}...</p>
                    <Link to={`/organization/${data.organization._id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>View Public Profile</Link>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '30px' }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Financial Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>UPI ID for Payouts</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. yourorg@upi"
                        value={data.organization.paymentInfo?.upiId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData(prev => ({
                            ...prev,
                            organization: { ...prev.organization, paymentInfo: { ...prev.organization.paymentInfo, upiId: val } }
                          }));
                        }}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const upiId = data.organization.paymentInfo?.upiId;
                        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
                        
                        if (upiId && !upiRegex.test(upiId)) {
                          alert('Please enter a valid UPI ID (e.g. name@bank)');
                          return;
                        }

                        try {
                          const config = { headers: { Authorization: `Bearer ${user.token}` } };
                          await axios.put(`https://fundhappiness.onrender.com/api/organizations/${data.organization._id}/payment`, { paymentInfo: data.organization.paymentInfo }, config);
                          alert('Payment settings saved successfully!');
                        } catch (err) {
                          alert('Error saving payment settings');
                        }
                      }}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.9rem' }}
                    >
                      Update Payout Info
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Your Campaigns</h2>
                  <Link to="/create-campaign" className="btn btn-primary">+ Create New</Link>
                </div>

                {data.campaigns.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <p>No campaigns created yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                    {data.campaigns.map(campaign => (
                      <Link to={`/campaign/${campaign._id}`} key={campaign._id} className="glass-panel" style={{ overflow: 'hidden' }}>
                        <img src={campaign.image} alt={campaign.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '20px' }}>
                          <h4 style={{ marginBottom: '10px' }}>{campaign.title}</h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Raised: ₹{campaign.raisedAmount.toLocaleString()} / ₹{campaign.goalAmount.toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <h2>Your Donations</h2>
          {data?.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>You haven't made any donations yet.</p>
              <Link to="/search" className="btn btn-primary">Explore Campaigns</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {data?.map(donation => (
                <div key={donation._id} className="glass-panel responsive-flex-row">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img
                      src={donation.campaign?.image || donation.organization?.image}
                      alt={donation.campaign?.title || donation.organization?.name}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                      <h4 style={{ marginBottom: '5px' }}>{donation.campaign?.title || `Support for ${donation.organization?.name}`}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(donation.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>+ ₹{donation.amount.toLocaleString()}</div>
                    <Link
                      to={donation.campaign ? `/campaign/${donation.campaign._id}` : `/organization/${donation.organization?._id}`}
                      style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Organizations You Follow Section */}
          <div style={{ marginTop: '50px' }}>
            <h2 style={{ marginBottom: '25px' }}>Initiatives You Follow</h2>
            {following.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>You aren't following any initiatives yet.</p>
                <Link to="/explore-ngos" className="btn btn-secondary" style={{ marginTop: '15px' }}>Explore Initiatives</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {following.map(org => (
                  <Link key={org._id} to={`/organization/${org._id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-panel h-100" style={{ padding: '20px', transition: 'transform 0.3s ease' }}>
                      <img 
                        src={org.image} 
                        alt={org.name} 
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} 
                      />
                      <h4 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>{org.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {org.mission}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
