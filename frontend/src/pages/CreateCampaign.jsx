import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: 'Social Work',
    image: '/images/default-org.png',
    deadline: '',
    organizationId: ''
  });
  const [galleryInput, setGalleryInput] = useState('');
  const [gallery, setGallery] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get('https://fundhappiness.onrender.com/api/organizations');
        const userOrgs = res.data.filter(org => org.owner._id === user?._id);
        setOrganizations(userOrgs);
        if (userOrgs.length > 0) {
          setFormData(prev => ({ ...prev, organizationId: userOrgs[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch initiatives');
      }
    };
    if (user) fetchOrgs();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      const res = await axios.post('https://fundhappiness.onrender.com/api/campaigns', { ...formData, gallery }, config);
      navigate(`/campaign/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    setIsUploading(true);
    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        } 
      };
      
      const uploadRes = await axios.post('https://fundhappiness.onrender.com/api/upload', uploadFormData, config);
      setFormData({ ...formData, image: `https://fundhappiness.onrender.com${uploadRes.data.url}` });
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const addGalleryImage = () => {
    if (galleryInput.trim()) {
      setGallery([ ...gallery, galleryInput.trim() ]);
      setGalleryInput('');
    }
  };

  const removeGalleryImage = (index) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Launch Initiative | FundHappiness</title>
        <meta name="description" content="Start your own social work campaign on FundHappiness." />
      </Helmet>

      <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ marginBottom: '40px', borderLeft: '6px solid var(--primary-color)', paddingLeft: '25px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px', fontWeight: '800' }}>Launch a New Initiative</h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px' }}>
              Define your goals, set your target, and start making a measurable impact in your community.
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            padding: '50px',
            border: '1px solid #e2e8f0'
          }}>
            {error && (
              <div style={{ background: '#fef2f2', color: '#991b1b', padding: '15px', marginBottom: '30px', borderRadius: '4px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  1. Operational Scope
                </h3>
                <div className="form-group">
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                    TITLE OF THE CAMPAIGN
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    className="form-control" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Emergency Food Relief 2024"
                    style={{ borderRadius: '0', border: '1px solid #cbd5e1', padding: '12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                    DESCRIPTION & IMPACT STRATEGY
                  </label>
                  <textarea 
                    name="description" 
                    className="form-control" 
                    rows="6" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required
                    placeholder="Provide a detailed overview of the problem and your proposed solution..."
                    style={{ borderRadius: '0', border: '1px solid #cbd5e1', padding: '12px' }}
                  ></textarea>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  2. Financials & Timeline
                </h3>
                <div className="responsive-grid-2col">
                  <div className="form-group">
                    <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                      TARGET GOAL (USD)
                    </label>
                    <input 
                      type="number" 
                      name="goalAmount" 
                      className="form-control" 
                      value={formData.goalAmount} 
                      onChange={handleChange} 
                      required 
                      min="1"
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                      CLOSING DATE
                    </label>
                    <input 
                      type="date" 
                      name="deadline" 
                      className="form-control" 
                      value={formData.deadline} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  3. Classification & Media
                </h3>
                <div className="responsive-grid-2col">
                  <div className="form-group">
                    <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                      SELECT INITIATIVE PROFILE
                    </label>
                    <select 
                      name="organizationId" 
                      className="form-control" 
                      value={formData.organizationId} 
                      onChange={handleChange}
                      required
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1' }}
                    >
                      <option value="" disabled>Choose your verified profile</option>
                      {organizations.map(org => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                      PRIMARY CATEGORY
                    </label>
                    <select 
                      name="category" 
                      className="form-control" 
                      value={formData.category} 
                      onChange={handleChange}
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Social Work">Social Work</option>
                      <option value="Health Response">Health Response</option>
                      <option value="Environmental Action">Environmental Action</option>
                      <option value="Education">Education</option>
                      <option value="Community Dev">Community Dev</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                    COVER IMAGE URL
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="url" 
                      name="image" 
                      className="form-control" 
                      value={formData.image} 
                      onChange={handleChange} 
                      required 
                      placeholder="Provide a high-quality link to your campaign photo"
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1', flex: 1 }}
                    />
                    <label 
                      className="btn btn-secondary" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        opacity: isUploading ? 0.7 : 1,
                        padding: '10px 20px',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        borderRadius: '0'
                      }}
                    >
                      {isUploading ? '...' : '📁 UPLOAD'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div style={{ marginTop: '15px' }}>
                      <img src={formData.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                    ADDITIONAL GALLERY IMAGES
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="url" 
                      className="form-control" 
                      value={galleryInput} 
                      onChange={(e) => setGalleryInput(e.target.value)} 
                      placeholder="Paste additional image URL here"
                      style={{ borderRadius: '0', border: '1px solid #cbd5e1' }}
                    />
                    <button 
                      type="button" 
                      onClick={addGalleryImage}
                      className="btn btn-primary"
                      style={{ borderRadius: '0', padding: '10px 20px' }}
                    >
                      +
                    </button>
                  </div>
                  
                  {gallery.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                      {gallery.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                          <img src={img} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                          <button 
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            style={{ 
                              position: 'absolute', top: '-5px', right: '-5px', 
                              background: '#ef4444', color: 'white', border: 'none', 
                              borderRadius: '50%', width: '18px', height: '18px', 
                              fontSize: '10px', cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '0' }} 
                disabled={loading || organizations.length === 0}
              >
                {loading ? 'INITIALIZING...' : 'LAUNCH INITIATIVE'}
              </button>
              {organizations.length === 0 && (
                <p style={{ color: '#b91c1c', marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                  You must register an initiative profile before you can launch a campaign.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCampaign;
