import React, { useState, useEffect } from 'react';

const Loading = () => {
  const [quote, setQuote] = useState("");
  
  const quotes = [
    "Giving is not just about making a donation. It's about making a difference.",
    "The best way to find yourself is to lose yourself in the service of others.",
    "Happiness is not something ready-made. It comes from your own actions.",
    "No one has ever become poor by giving.",
    "Your contribution can change a life today.",
    "Together, we are making the world a happier place."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="loading-overlay" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="glass-card">
        <div className="loading-animation" style={{
          marginBottom: '40px',
          animation: 'heartbeat 1.5s infinite ease-in-out'
        }}>
          <img src="/logo-green.png" alt="Loading" style={{ height: '120px', width: 'auto' }} />
        </div>
        
        <div style={{
          color: '#2e7d32',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
               Loading Please wait.....<br/><br/>
                  FundHappiness <br/>
        </div>
        
        <p style={{
          color: '#b40917ff',
          fontSize: '1.1rem',
          maxWidth: '400px',
          textAlign: 'center',
          padding: '0 20px',
          lineHeight: '1.6',
          fontStyle: 'italic'
        }}>
          {/* "{quote}" */}
        </p>
      </div>

      <style>
        {`
          @keyframes heartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.1); }
            28% { transform: scale(1); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;
