import React, { useState, useEffect } from "react";
import { Oval } from "react-loader-spinner";
import "./PriceDisplay.css";
import ChartDisplay from "./ChartDisplay";

const PriceDisplay = () => {
  const [price, setPrice] = useState(null);
  const [prediction, setPrediction] = useState("WAITING");
  const [chartUrl, setChartUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.1, 1.8));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.1, 0.6));

  useEffect(() => {
    let chartObjectUrl = null;
    const fetchData = () => {
      fetch("http://localhost:8000/predict")
        .then((response) => response.json())
        .then((data) => {
          console.log('Prediction API response:', data);
          setPrice(data.price);
          setPrediction(data.prediction);
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
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.7rem' }}>
        <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">-</button>
        <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">+</button>
      </div>
      <div
        className="price-card"
        style={{
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.25s cubic-bezier(.4,2.3,.3,1)',
          transformOrigin: 'top center',
        }}
      >
        <div className="price-title">Bitcoin Trading Prediction</div>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          Refresh
        </button>
        <ChartDisplay chartUrl={chartUrl} />
        {price === null && prediction === "WAITING" ? (
          <div className="loading">
            <Oval height={50} width={50} color="blue" ariaLabel="loading" />
            <p>Loading...</p>
          </div>
        ) : price === null && prediction === null ? (
          <div className="error-message">No data available.</div>
        ) : (
          <>
            <div className="price-value">${price}</div>
            <div className={`prediction ${prediction}`}>Prediction: {prediction}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
