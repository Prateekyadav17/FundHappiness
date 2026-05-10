import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

const CreateOrganization = () => {
  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    image: '/images/default-org.png'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const res = await axios.post('https://fundhappiness.onrender.com/api/organizations', formData, config);
      navigate(`/organization/${res.data._id}`);
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

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Register Initiative | FundHappiness</title>
        <meta name="description" content="Register your social initiative or good work on FundHappiness." />
      </Helmet>

      <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ marginBottom: '40px', borderLeft: '6px solid var(--primary-color)', paddingLeft: '25px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px', fontWeight: '800' }}>Register Your Initiative</h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px' }}>
              Every great change starts with a single step. Formalize your social work and start connecting with global supporters.
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '0', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            padding: '50px',
            border: '1px solid #e2e8f0'
          }}>
            {error && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fee2e2', 
                color: '#991b1b', 
                padding: '15px', 
                marginBottom: '30px',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  1. Basic Identification
                </h3>
                <div className="form-group">
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                    OFFICIAL NAME OF THE INITIATIVE
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Global Health Equity Project"
                    style={{ borderRadius: '4px', border: '1px solid #cbd5e1', padding: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  2. Mission & Scope
                </h3>
                <div className="form-group">
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                    MISSION STATEMENT
                  </label>
                  <textarea 
                    name="mission" 
                    className="form-control" 
                    rows="6" 
                    value={formData.mission} 
                    onChange={handleChange} 
                    required
                    placeholder="Describe the core purpose and the impact you aim to achieve..."
                    style={{ borderRadius: '4px', border: '1px solid #cbd5e1', padding: '12px' }}
                  ></textarea>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
                    Aim for clarity and transparency. Explain who you help and how.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  3. Visual Identity
                </h3>
                <div className="form-group">
                  <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                    PRIMARY IMAGE URL
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="url" 
                      name="image" 
                      className="form-control" 
                      value={formData.image} 
                      onChange={handleChange} 
                      required 
                      placeholder="https://images.unsplash.com/photo-..."
                      style={{ borderRadius: '4px', border: '1px solid #cbd5e1', padding: '12px', flex: 1 }}
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
                        whiteSpace: 'nowrap'
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
                      <img src={formData.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '16px 40px', 
                    borderRadius: '4px', 
                    fontSize: '1rem', 
                    fontWeight: '700',
                    boxShadow: 'none'
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Register Initiative'}
                </button>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  By registering, you agree to our guidelines for transparent social work.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrganization;
