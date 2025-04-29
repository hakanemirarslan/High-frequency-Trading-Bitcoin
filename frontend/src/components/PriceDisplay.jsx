import React, { useState, useEffect } from "react";
import { Oval } from "react-loader-spinner";

const PriceDisplay = () => {
  const [price, setPrice] = useState(null);
  const [prediction, setPrediction] = useState("WAITING");
  const [chartUrl, setChartUrl] = useState(null);

  // Poll for prediction and chart every 30 seconds
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
    <div>
        <h1>Bitcoin Trading Prediction</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        <button
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer"
          }}
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
      {/* Chart display logic */}
      {chartUrl === null ? (
        <div>
          <Oval height={40} width={40} color="blue" ariaLabel="loading" />
          <p>Loading chart...</p>
        </div>
      ) : chartUrl === 'error' ? (
        <div style={{ color: 'red' }}>Chart could not be loaded.</div>
      ) : (
        <img src={chartUrl} alt="BTC Chart" style={{ maxWidth: '100%', height: 'auto' }} />
      )}

      {price === null && prediction === "WAITING" ? (
        <div>
          <Oval height={50} width={50} color="blue" ariaLabel="loading" />
          <p>Loading...</p>
        </div>
      ) : price === null && prediction === null ? (
        <div style={{ color: 'red' }}>No data available.</div>
      ) : (
        <div>
          <h1>BTC Price: ${price}</h1>
          <h1>Price: ${price}</h1>
          <h2>Prediction: {prediction}</h2>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
