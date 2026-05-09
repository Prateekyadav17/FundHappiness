import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const OrganizationProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState({ organization: null, campaigns: [] });
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [quickDonateAmount, setQuickDonateAmount] = useState(500);
  const [isDonating, setIsDonating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [donors, setDonors] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '', image: '', campaignId: '' });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const shareableUrl = window.location.href;
  
  // Dynamic QR Code: Use UPI Payment QR if UPI ID is set, otherwise use Page URL
  const qrData = data.organization?.paymentInfo?.upiId 
    ? `upi://pay?pa=${data.organization.paymentInfo.upiId}&pn=${encodeURIComponent(data.organization.name)}&cu=INR`
    : shareableUrl;
    
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=4caf50`;

  const fallbackImages = [
    '/images/default-org.png'
  ];

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchOrg = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/organizations/${id}`);
        setData(res.data);
        
        // Fetch updates
        const updatesRes = await axios.get(`http://localhost:5000/api/updates/organization/${id}`);
        setUpdates(updatesRes.data);

        // Fetch donors if owner
        if (user && res.data.organization.owner === user._id) {
          const donorsRes = await axios.get(`http://localhost:5000/api/donations/organization/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setDonors(donorsRes.data);
        }
      } catch (error) {
        console.error('Error fetching org data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [id]);

  const handleQuickDonate = async () => {
    if (!user) return navigate('/login');
    setIsDonating(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data: order } = await axios.post(
        'http://localhost:5000/api/donations/create-order',
        { amount: quickDonateAmount, organizationId: id }, 
        config
      );

      const options = {
        key: 'rzp_test_SlyS9DgavWT4kZ',
        amount: order.amount,
        currency: order.currency,
        name: data.organization.name,
        description: `Support for ${data.organization.name}`,
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
            await axios.post('http://localhost:5000/api/donations/record', {
              organizationId: id,
              amount: quickDonateAmount,
              paymentId: response.razorpay_payment_id
            }, config);
            
            alert('Thank you for your generous support!');
          } catch (err) {
            console.error(err);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: { color: '#4caf50' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Could not initialize payment. Please try again.');
    } finally {
      setIsDonating(false);
    }
  };

  useEffect(() => {
    if (!data.organization) return;
    const images = data.organization.carouselImages?.length > 0 ? data.organization.carouselImages : fallbackImages;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data.organization]);

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.title || !newUpdate.content) return alert('Title and content are required');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('http://localhost:5000/api/updates', {
        ...newUpdate,
        organizationId: id
      }, config);
      
      setUpdates([res.data, ...updates]);
      setNewUpdate({ title: '', content: '', image: '', campaignId: '' });
      setShowUpdateForm(false);
      alert('Update posted successfully!');
    } catch (error) {
      console.error('Error creating update', error);
      alert('Failed to post update');
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/updates/${updateId}`, config);
      setUpdates(updates.filter(u => u._id !== updateId));
    } catch (error) {
      console.error('Error deleting update', error);
    }
  };

  const toggleMembership = async () => {
    if (!user) return navigate('/login');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`http://localhost:5000/api/organizations/${id}/membership`, {}, config);
      
      const isNowMember = res.data.isMember;
      setData(prev => {
        const newMembers = isNowMember 
          ? [...prev.organization.members, { _id: user._id, name: user.name }]
          : prev.organization.members.filter(m => m._id !== user._id);
        
        return {
          ...prev,
          organization: { ...prev.organization, members: newMembers }
        };
      });
    } catch (error) {
      console.error(error);
      alert('Error updating membership');
    }
  };

  const addCarouselImage = async () => {
    if (!imageUrlInput.trim()) return;
    try {
      const newImages = [...(data.organization.carouselImages || []), imageUrlInput.trim()];
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`http://localhost:5000/api/organizations/${id}/carousel`, { carouselImages: newImages }, config);
      
      setData(prev => ({
        ...prev,
        organization: { ...prev.organization, carouselImages: res.data.carouselImages }
      }));
      setImageUrlInput('');
    } catch (error) {
      console.error(error);
      alert('Error adding image');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        } 
      };
      
      // 1. Upload to server
      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, config);
      const uploadedUrl = `http://localhost:5000${uploadRes.data.url}`;

      // 2. Add to carousel
      const newImages = [...(data.organization.carouselImages || []), uploadedUrl];
      const updateConfig = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`http://localhost:5000/api/organizations/${id}/carousel`, { carouselImages: newImages }, updateConfig);
      
      setData(prev => ({
        ...prev,
        organization: { ...prev.organization, carouselImages: res.data.carouselImages }
      }));
      
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };


  if (loading) return <Loading />;
  if (!data.organization) return <div className="container" style={{ marginTop: '50px' }}>Organization not found.</div>;

  const org = data.organization;
  const isMember = user && org.members.some(m => m._id === user._id);
  const isOwner = user && org.owner._id === user._id;
  const carouselImages = org.carouselImages?.length > 0 ? org.carouselImages : fallbackImages;

  return (
    <>
      <Helmet>
        <title>{org.name} | FundHappiness</title>
        <meta name="description" content={org.mission.substring(0, 150)} />
      </Helmet>

      {/* Enhanced Multi-Image Carousel Hero */}
      <div className="carousel-hero org-carousel-hero" style={{ borderRadius: '0' }}>
        {carouselImages.map((img, idx) => (
          <div 
            key={idx} 
            className={`carousel-slide ${idx === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          >
            <div className="carousel-overlay" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)' }}></div>
            <div className="container carousel-content">
              <div className="responsive-grid-hero">
                <div style={{ animation: 'fadeInUp 1s ease-out' }}>
                  <h1 className="responsive-hero-title">{org.name}</h1>
                  <p style={{ 
                    fontSize: '1.2rem', 
                    maxWidth: '800px', 
                    color: '#f3f4f6', 
                    lineHeight: '1.8',
                    display: '-webkit-box',
                    WebkitLineClamp: '4',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '30px'
                  }}>
                    {org.mission}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={() => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' })} className="btn btn-secondary" style={{ color: 'white', borderColor: 'white', padding: '10px 15px' }}>Learn More</button>
                    {isOwner ? (
                      <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'default', padding: '10px 15px' }}>⭐ Organization Admin</button>
                    ) : isMember ? (
                      <button onClick={toggleMembership} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 15px' }}>✓ Joined</button>
                    ) : (
                      <button onClick={toggleMembership} className="btn" style={{ background: '#fbbf24', color: '#1e293b', padding: '10px 15px', fontWeight: 'bold' }}>Join Community</button>
                    )}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: org.name, text: org.mission?.substring(0, 100) + '...', url: shareableUrl });
                        } else {
                          setIsShareOpen(true);
                        }
                      }}
                      className="btn"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '10px 15px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)' }}
                      title="Share this page"
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button onClick={() => document.getElementById('qr-section').scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '30px', fontWeight: '800', boxShadow: '0 10px 20px rgba(76, 175, 80, 0.3)' }}>Donate Now</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="container" style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>
        
        {/* Management Dashboard for Owners (Cleaned up) */}
        {isOwner && (
          <div style={{ marginBottom: '60px' }}>
            <h2 className="section-title" style={{ marginBottom: '30px' }}>Management Dashboard</h2>
            <div className="responsive-grid-dashboard">
              <div className="glass-panel" style={{ padding: '30px', borderLeft: '5px solid var(--primary-color)' }}>
                <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>🖼️ Carousel Images</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Add high-quality photos (URLs) to your profile header.</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginBottom: '15px', fontStyle: 'italic' }}>
                  Tip: Use direct links from sites like Unsplash for best results.
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input 
                    type="url" 
                    className="form-control" 
                    value={imageUrlInput} 
                    onChange={(e) => setImageUrlInput(e.target.value)} 
                    placeholder="Paste image URL..."
                  />
                  <button onClick={addCarouselImage} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    + Add URL
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <label 
                    className="btn btn-secondary" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px', 
                      width: '100%', 
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      opacity: isUploading ? 0.7 : 1,
                      padding: '12px'
                    }}
                  >
                    {isUploading ? '📤 UPLOADING...' : '📁 UPLOAD FROM GALLERY'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={isUploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {org.carouselImages?.length > 0 && (
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {org.carouselImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative', minWidth: '100px' }}>
                        <img src={img} style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                        <button 
                          onClick={async () => {
                            const newImages = org.carouselImages.filter((_, idx) => idx !== i);
                            const config = { headers: { Authorization: `Bearer ${user.token}` } };
                            const res = await axios.put(`http://localhost:5000/api/organizations/${id}/carousel`, { carouselImages: newImages }, config);
                            setData(prev => ({ ...prev, organization: { ...prev.organization, carouselImages: res.data.carouselImages } }));
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '30px', borderLeft: '5px solid var(--primary-color)' }}>
                <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>💳 Payout Settings</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Set where you want to receive your donations.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={org.paymentInfo?.upiId || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setData(prev => ({
                        ...prev,
                        organization: { 
                          ...prev.organization, 
                          paymentInfo: { ...prev.organization.paymentInfo, upiId: val } 
                        }
                      }));
                    }} 
                    placeholder="UPI ID (e.g. org@upi)"
                  />
                  <button 
                    onClick={async () => {
                      try {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        await axios.put(`http://localhost:5000/api/organizations/${id}/payment`, { paymentInfo: org.paymentInfo }, config);
                        alert('Settings saved!');
                      } catch (err) {
                        alert('Error saving settings');
                      }
                    }} 
                    className="btn btn-secondary"
                  >
                    Save Financial Info
                  </button>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '30px', borderLeft: '5px solid var(--primary-color)' }}>
                <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>📊 Impact Metrics</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Showcase your results (e.g. "10k+ Trees Planted").</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(org.stats && org.stats.length > 0 ? org.stats : [{ label: 'Trees Planted', value: '12k+' }, { label: 'Survival Rate', value: '85%' }, { label: 'Villages Reached', value: '50+' }]).map((stat, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Value (e.g. 10k+)"
                        style={{ flex: 1 }}
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...(org.stats?.length > 0 ? org.stats : [{ label: 'Trees Planted', value: '12k+' }, { label: 'Survival Rate', value: '85%' }, { label: 'Villages Reached', value: '50+' }])];
                          newStats[i] = { ...newStats[i], value: e.target.value };
                          setData(prev => ({ ...prev, organization: { ...prev.organization, stats: newStats } }));
                        }}
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Label (e.g. Lives Impacted)"
                        style={{ flex: 2 }}
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...(org.stats?.length > 0 ? org.stats : [{ label: 'Trees Planted', value: '12k+' }, { label: 'Survival Rate', value: '85%' }, { label: 'Villages Reached', value: '50+' }])];
                          newStats[i] = { ...newStats[i], label: e.target.value };
                          setData(prev => ({ ...prev, organization: { ...prev.organization, stats: newStats } }));
                        }}
                      />
                    </div>
                  ))}
                  <button 
                    onClick={async () => {
                      try {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        const finalStats = org.stats?.length > 0 ? org.stats : [{ label: 'Trees Planted', value: '12k+' }, { label: 'Survival Rate', value: '85%' }, { label: 'Villages Reached', value: '50+' }];
                        await axios.put(`http://localhost:5000/api/organizations/${id}/stats`, { stats: finalStats }, config);
                        alert('Impact stats updated!');
                      } catch (err) {
                        alert('Error saving stats');
                      }
                    }}
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                  >
                    Save Impact Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="responsive-grid-main" style={{ marginTop: '40px' }}>
          <div>
            {/* About Us Section */}
            <div id="about-section" className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
              <h2 className="section-title">About Us</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <p className="responsive-about-text" style={{ 
                  display: isReadMoreOpen ? 'block' : '-webkit-box',
                  WebkitLineClamp: isReadMoreOpen ? 'unset' : '5',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  {org.mission}
                </p>
                <button 
                  onClick={() => setIsReadMoreOpen(!isReadMoreOpen)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary-color)', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    padding: '10px 0',
                    fontSize: '1rem',
                    marginTop: '5px'
                  }}
                >
                  {isReadMoreOpen ? 'Show Less' : 'Read More ▼'}
                </button>
              </div>
            </div>

            {/* Our Impact Section */}
            <div id="qr-section" className="glass-panel" style={{ padding: '40px', marginBottom: '40px', textAlign: 'center' }}>
              <h2 className="section-title">Support This Initiative</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ 
                  padding: '30px', 
                  borderRadius: '30px', 
                  background: 'rgba(255,255,255,0.98)',
                  textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  width: '100%',
                  maxWidth: '400px',
                  border: 'none'
                }}>
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Select Amount (₹)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                      {[500, 1000, 2000].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setQuickDonateAmount(amt)}
                          style={{ 
                            padding: '10px', 
                            borderRadius: '10px', 
                            border: quickDonateAmount === amt ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                            background: quickDonateAmount === amt ? 'rgba(76, 175, 80, 0.1)' : 'white',
                            fontWeight: '700',
                            color: quickDonateAmount === amt ? 'var(--primary-color)' : '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={quickDonateAmount} 
                      onChange={(e) => setQuickDonateAmount(e.target.value)}
                      placeholder="Custom Amount"
                      style={{ textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', borderRadius: '12px' }}
                    />
                  </div>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button 
                      onClick={handleQuickDonate}
                      disabled={isDonating}
                      className="btn btn-primary" 
                      style={{ 
                        width: '100%', 
                        padding: '16px', 
                        borderRadius: '15px', 
                        fontWeight: '800', 
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                        boxShadow: '0 10px 20px rgba(46, 125, 50, 0.2)'
                      }}
                    >
                      {isDonating ? 'PREPARING...' : 'ONLINE (CARDS & NET)'}
                    </button>
                  </div>
                </div>

                {org.paymentInfo?.upiId && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Or Scan with any UPI App</h3>
                    <div style={{ padding: '20px', background: 'white', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                      <img src={qrCodeUrl} alt="Scan to Support" style={{ width: '250px' }} />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)' }}>GPay, PhonePe, Paytm, and more</p>
                      <div style={{ marginTop: '10px', padding: '8px 16px', background: '#f8fafc', borderRadius: '10px', fontWeight: '600', color: 'var(--primary-color)' }}>
                        ID: {org.paymentInfo.upiId}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              <h2 className="section-title">Our Global Impact</h2>
              <div className="impact-stats">
                {(org.stats && org.stats.length > 0 ? org.stats : [
                  { label: 'Trees Planted', value: '12k+' }, 
                  { label: 'Survival Rate', value: '85%' }, 
                  { label: 'Villages Reached', value: '50+' }
                ]).map((stat, i) => (
                  <div className="stat-card" key={i}>
                    <span className="stat-number">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
              <img src={carouselImages[activeSlide]} alt="Impact" className="impact-img" />
              
              {/* Impact Updates Section */}
              <div style={{ marginTop: '60px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Impact Updates</h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{updates.length} stories shared</span>
                </div>

                {updates.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No updates posted yet. Stay tuned for our impact stories!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {updates.map(update => (
                      <div key={update._id} className="glass-panel" style={{ padding: '30px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                        {update.image && (
                          <div style={{ flex: '0 0 200px', height: '150px', borderRadius: '15px', overflow: 'hidden' }}>
                            <img src={update.image} alt={update.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ flex: '1', minWidth: '250px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.4rem' }}>{update.title}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(update.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{update.content}</p>
                          {isOwner && (
                            <button 
                              onClick={() => handleDeleteUpdate(update._id)}
                              style={{ marginTop: '15px', color: '#ff5252', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                              Delete Update
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Campaigns Section */}
            <div style={{ marginTop: '50px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="section-title" style={{ marginBottom: '0' }}>Active Initiatives</h2>
                {isOwner && (
                  <Link to="/create-campaign" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>+ Launch New</Link>
                )}
              </div>
              
              {data.campaigns.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <p>No active initiatives at this time. Stay tuned!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
                  {data.campaigns.map(campaign => {
                    const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
                    return (
                      <Link to={`/campaign/${campaign._id}`} key={campaign._id}>
                        <div className="glass-panel responsive-campaign-card">
                          <img src={campaign.image} alt={campaign.title} className="responsive-campaign-image" />
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <h4 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{campaign.title}</h4>
                              <span style={{ background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE</span>
                            </div>
                            <div className="progress-container" style={{ height: '10px', marginBottom: '10px' }}>
                              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                                ₹{campaign.raisedAmount.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>raised of ₹{campaign.goalAmount.toLocaleString()}</span>
                              </div>
                              <div style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{Math.round(progress)}%</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Community Sidebar */}
          <div>
            <div className="glass-panel" style={{ padding: '35px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', textAlign: 'center' }}>Initiative Community</h3>
              
              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', 
                padding: '40px 20px', 
                borderRadius: '20px', 
                textAlign: 'center', 
                marginBottom: '30px',
                color: 'white',
                boxShadow: '0 10px 20px rgba(76, 175, 80, 0.2)'
              }}>
                <div style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1' }}>
                  {org.members.length}
                </div>
                <div style={{ fontSize: '1rem', opacity: '0.9', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '2px' }}>Members</div>
              </div>

              <button 
                onClick={isOwner ? null : toggleMembership} 
                className={`btn ${isOwner ? 'btn-secondary' : isMember ? 'btn-secondary' : 'btn-primary'}`} 
                style={{ width: '100%', marginBottom: '25px', padding: '15px', fontWeight: '700', borderRadius: '12px', cursor: isOwner ? 'default' : 'pointer' }}
              >
                {isOwner ? '⭐ YOU ARE THE ADMIN' : isMember ? '✓ ALREADY A MEMBER' : 'JOIN THIS COMMUNITY'}
              </button>

              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Contributors</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {org.members.slice(0, 8).map(m => (
                    <div key={m._id} style={{ 
                      background: 'white', 
                      padding: '6px 12px', 
                      borderRadius: '30px', 
                      fontSize: '0.8rem', 
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      🟢 {m.name}
                    </div>
                  ))}
                  {org.members.length > 8 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '6px' }}>+{org.members.length - 8} more</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Management Dashboard - Only for Owners */}
        {isOwner && (
          <div style={{ marginTop: '60px' }}>
            <h2 className="section-title">Management Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              
              {/* Analytics & Stats */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)' }}>Platform Insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>{org.views || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Profile Views</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary-color)' }}>{org.members.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Members</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '20px', padding: '12px' }}
                >
                  {showUpdateForm ? '✕ CANCEL' : '📝 POST NEW UPDATE'}
                </button>

                {showUpdateForm && (
                  <form onSubmit={handleCreateUpdate} style={{ marginTop: '20px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '15px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Update Title" 
                      style={{ marginBottom: '10px' }}
                      value={newUpdate.title}
                      onChange={e => setNewUpdate({...newUpdate, title: e.target.value})}
                    />
                    <textarea 
                      className="form-control" 
                      placeholder="Share what's happening..." 
                      rows="4" 
                      style={{ marginBottom: '10px' }}
                      value={newUpdate.content}
                      onChange={e => setNewUpdate({...newUpdate, content: e.target.value})}
                    ></textarea>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Image URL (optional)" 
                      style={{ marginBottom: '15px' }}
                      value={newUpdate.image}
                      onChange={e => setNewUpdate({...newUpdate, image: e.target.value})}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>PUBLISH STORY</button>
                  </form>
                )}
              </div>

              {/* Recent Donors List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)' }}>Recent Supporters</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {donors.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No donations recorded yet.</p>
                  ) : (
                    donors.map(donation => (
                      <div key={donation._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{donation.user?.name || 'Anonymous'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(donation.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontWeight: '800', color: 'var(--primary-color)' }}>₹{donation.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Share Modal — Bottom Sheet */}
      {isShareOpen && (
        <div
          onClick={() => setIsShareOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)', borderRadius: '24px 24px 0 0',
              padding: '30px 25px 40px', width: '100%', maxWidth: '480px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Share this Initiative</h3>
              <button onClick={() => setIsShareOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <a href={`https://wa.me/?text=${encodeURIComponent(org.name + ' - ' + shareableUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>💬</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>WhatsApp</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Support ' + org.name + ' on FundHappiness!')}&url=${encodeURIComponent(shareableUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'serif' }}>𝕏</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Twitter</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👍</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Facebook</span>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>💼</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>LinkedIn</span>
              </a>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--background-alt)', borderRadius: '12px', padding: '12px 15px' }}>
              <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareableUrl}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(shareableUrl); alert('Link copied!'); }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '8px' }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizationProfile;
