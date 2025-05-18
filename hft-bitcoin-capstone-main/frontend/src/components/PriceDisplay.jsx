import React, { useState, useEffect } from 'react';
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import ChartDisplay from './ChartDisplay';

const PriceDisplay = () => {
  const [price, setPrice] = useState(null);
  const [prediction, setPrediction] = useState('WAITING');
  const [chartUrl, setChartUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.1, 1.8));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.1, 0.6));

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
    let chartObjectUrl = null;
    const fetchData = () => {
      fetch("http://localhost:8000/predict")
        .then((response) => response.json())
        .then((data) => {
          console.log('Prediction API response:', data);
          setPrice(data.price);
          setPrediction(data.prediction);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching price:", error);
        });
      fetch("http://localhost:8000/chart")
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then((blob) => {
          if (chartObjectUrl) URL.revokeObjectURL(chartObjectUrl);
          chartObjectUrl = URL.createObjectURL(blob);
          setChartUrl(chartObjectUrl);
        })
        .catch((error) => {
          console.error("Error fetching chart:", error);
          setChartUrl('error');
        });
    };
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => {
      clearInterval(interval);
      if (chartObjectUrl) URL.revokeObjectURL(chartObjectUrl);
    };
  }, [navigate]);

  if (!user) {
    return (
      <div className="loading-container">
        <Oval color="#4a6cf7" height={50} width={50} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>Welcome back, {user.name || 'Trader'}! 👋</h1>
        <p className="welcome-message">
          Stay updated with the latest Bitcoin price predictions and market trends.
        </p>
      </div>

      <div
        className="price-container"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="price-title">Bitcoin Trading Prediction</div>
        <ChartDisplay chartUrl={chartUrl} />
        
        {isLoading ? (
          <div className="loading">
            <Oval height={50} width={50} color="#4a6cf7" ariaLabel="loading" />
            <p>Loading market data...</p>
          </div>
        ) : (
          <div className="prediction-result">
            <div className="price">Current Price: ${price}</div>
            <div className={`prediction ${prediction.toLowerCase()}`}>
              Prediction: {prediction}
            </div>
          </div>
        )}
        
        <div className="chart-controls">
          <div className="zoom-controls">
            <button 
              onClick={handleZoomIn} 
              disabled={zoomLevel >= 1.8}
              className="zoom-button"
            >
              Zoom In (+)
            </button>
            <button 
              onClick={handleZoomOut} 
              disabled={zoomLevel <= 0.6}
              className="zoom-button"
            >
              Zoom Out (-)
            </button>
          </div>
          <button 
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          className="action-button primary"
          onClick={() => navigate('/wallet')}
        >
          View Wallet
        </button>
        <button 
          className="action-button secondary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to Top
        </button>
      </div>
    </div>
  );
};

export default PriceDisplay;
