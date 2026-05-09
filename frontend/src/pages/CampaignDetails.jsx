import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

// Quick-select donation amounts
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const RazorpayCheckout = ({ campaignId, campaignTitle, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // 1. Create order on backend
      const { data: order } = await axios.post(
        'http://localhost:5000/api/donations/create-order',
        { amount, campaignId }, 
        config
      );

      // 2. Initialize Razorpay Options
      const options = {
        key: 'rzp_test_SlyS9DgavWT4kZ', // Test Key
        amount: order.amount,
        currency: order.currency,
        name: 'FundHappiness',
        description: `Support: ${campaignTitle}`,
        order_id: order.id,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [{ method: 'upi' }]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async (response) => {
          try {
            // 3. Record successful donation
            await axios.post('http://localhost:5000/api/donations/record', {
              campaignId,
              amount,
              paymentId: response.razorpay_payment_id
            }, config);
            
            onSuccess(amount);
          } catch (err) {
            setError('Payment recorded locally failed, but transaction was successful. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: {
          color: '#4caf50',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Could not initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px', fontWeight: '600' }}>CHOOSE AMOUNT (INR)</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
        {QUICK_AMOUNTS.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            style={{
              padding: '12px 0',
              borderRadius: '12px',
              border: `1px solid ${amount === a ? 'var(--primary-color)' : '#cbd5e1'}`,
              background: amount === a ? 'var(--primary-color)' : 'white',
              color: amount === a ? '#fff' : '#475569',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ₹{a.toLocaleString()}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="number"
          className="form-control"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          style={{ paddingLeft: '30px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
          placeholder="Other amount"
        />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>₹</span>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center' }}>⚠️ {error}</div>}

      <button 
        onClick={handlePayment} 
        className="btn btn-primary" 
        disabled={loading} 
        style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '12px' }}
      >
        {loading ? 'PREPARING...' : `CONTRIBUTE ₹${Number(amount).toLocaleString()}`}
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: '20px', opacity: 0.6 }} />
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '15px', opacity: 0.6 }} />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '20px', opacity: 0.6 }} />
      </div>
    </div>
  );
};

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/campaigns/${id}`);
        setCampaign(res.data);
      } catch (error) {
        console.error('Error fetching campaign', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();

    return () => {
      document.body.removeChild(script);
    };
  }, [id]);

  const handleDonationSuccess = (amount) => {
    setCampaign(prev => ({ ...prev, raisedAmount: prev.raisedAmount + Number(amount) }));
    alert('Thank you! Your contribution has been recorded successfully.');
  };

  if (loading) return <Loading />;
  if (!campaign) return <div className="container" style={{ marginTop: '50px' }}>Campaign not found.</div>;

  const progressPercentage = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);

  return (
    <>
      <Helmet>
        <title>{campaign.title} | FundHappiness</title>
      </Helmet>

      {/* Professional Header Section */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '50px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: '1' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {campaign.category || 'Humanitarian Response'}
              </span>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.1', marginTop: '10px' }}>
                {campaign.title}
              </h1>
              <div style={{ marginTop: '25px', display: 'flex', gap: '20px', alignItems: 'center', color: '#64748b', fontSize: '1rem' }}>
                <span>Published: {new Date(campaign.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>By: <strong style={{ color: '#1e293b' }}>{campaign.organization?.name || 'Verified Social Initiative'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container" style={{ marginTop: '60px', marginBottom: '100px' }}>
        <div className="responsive-grid-sidebar">
          
          {/* Content Column */}
          <article>
            <img 
              src={campaign.image} 
              alt={campaign.title} 
              style={{ width: '100%', height: '500px', objectFit: 'cover', marginBottom: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
            />

            {/* Gallery Section */}
            {campaign.gallery && campaign.gallery.length > 0 && (
              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Media Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  {campaign.gallery.map((img, idx) => (
                    <img key={idx} src={img} alt="Gallery" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            )}

            <section style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '25px', color: '#1e293b', borderBottom: '5px solid var(--primary-color)', display: 'inline-block' }}>
                The Initiative Purpose
              </h2>
              <div style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#334155', whiteSpace: 'pre-wrap' }}>
                {campaign.description}
              </div>
            </section>

            <div style={{ background: 'var(--background-alt)', padding: '40px', borderRadius: '24px', borderLeft: '10px solid var(--primary-color)' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '15px' }}>Why This Matters</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#475569' }}>
                Every contribution directly supports our field operations. We maintain 100% transparency with periodic impact reports sent to all contributors.
              </p>
            </div>
          </article>

          {/* Action Sidebar */}
          <aside>
            <div style={{ position: 'sticky', top: '100px' }}>
              <div className="glass-panel" style={{ padding: '35px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '25px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Funding Progress
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                      ₹{campaign.raisedAmount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '1rem', color: '#64748b', paddingBottom: '5px' }}>
                      of ₹{campaign.goalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-container" style={{ height: '12px', borderRadius: '6px' }}>
                    <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <p style={{ textAlign: 'right', fontSize: '0.9rem', color: '#64748b', marginTop: '12px', fontWeight: '600' }}>
                    {Math.round(progressPercentage)}% Successfully Raised
                  </p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '35px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', color: '#1e293b', textAlign: 'center' }}>Make an Impact</h3>
                
                {!user ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '25px', color: '#64748b', lineHeight: '1.6' }}>Please sign in to contribute to this social initiative.</p>
                    <button 
                      onClick={() => navigate('/login')} 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '18px', borderRadius: '12px', fontWeight: '800' }}
                    >
                      LOGIN TO CONTRIBUTE
                    </button>
                  </div>
                ) : (
                  <RazorpayCheckout 
                    campaignId={campaign._id} 
                    campaignTitle={campaign.title} 
                    onSuccess={handleDonationSuccess} 
                  />
                )}
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center', padding: '0 20px' }}>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Your donation is secure. By contributing, you agree to our terms of service.
                  <br /><br />
                  <Link to={`/organization/${campaign.organization?._id}`} style={{ color: 'var(--primary-color)', fontWeight: '800', textDecoration: 'none' }}>
                    View {campaign.organization?.name} Profile &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default CampaignDetails;
