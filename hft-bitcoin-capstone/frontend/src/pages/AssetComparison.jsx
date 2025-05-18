import React, { useState, useEffect } from 'react';
import { Oval } from 'react-loader-spinner';
import '../styles/AssetComparison.css';

const AssetComparison = () => {
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the comparison chart from the backend
    const fetchComparisonChart = async () => {
      try {
        const response = await fetch('http://localhost:8000/comparison');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setChartUrl(objectUrl);
      } catch (error) {
        console.error('Error fetching comparison chart:', error);
        setChartUrl('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonChart();
  }, []);

  return (
    <div className="comparison-container">
      <h1>Asset Comparison</h1>
      
      {isLoading ? (
        <div className="loading-container">
          <Oval height={60} width={60} color="#3b82f6" ariaLabel="loading" />
          <p>Loading comparison chart...</p>
        </div>
      ) : chartUrl === 'error' ? (
        <div className="error-container">
          <p>Failed to load comparison chart. Please try again later.</p>
        </div>
      ) : (
        <div className="chart-container">
          <img src={chartUrl} alt="Asset Comparison Chart" className="comparison-chart" />
        </div>
      )}
    </div>
  );
};

export default AssetComparison;
