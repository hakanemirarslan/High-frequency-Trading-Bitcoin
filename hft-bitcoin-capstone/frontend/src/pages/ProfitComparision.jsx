import React, { useState } from "react";
import axios from "axios";
import "../styles/ProfitComparison.css";

const ProfitComparison = () => {
  const [startDate, setStartDate] = useState("");
  const [assets, setAssets] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!startDate || !assets) {
      setError("Please enter both date and assets");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const queryAssets = assets
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a !== "")
        .join(",");

      const response = await axios.get(
        `http://localhost:8000/investment?assets=${queryAssets},BTC&start_date=${startDate}`
      );

      setData(response.data.buy_and_hold || []);
    } catch (error) {
      console.error("Error fetching investment data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, isCurrency = false, decimals = 2) => {
    if (value === null || value === undefined) return "N/A";
    if (isCurrency) return `$${parseFloat(value).toFixed(decimals)}`;
    return parseFloat(value).toFixed(decimals);
  };

  const getReturnClass = (value) => {
    if (value === undefined || value === null) return "";
    return parseFloat(value) >= 0 ? "positive" : "negative";
  };

  return (
    <div className="profit-comparison-container">
      <header className="page-header">
        <h1>Profit Comparison</h1>
      </header>

      <div className="comparison-layout">
        {/* Left Column - Form */}
        <div className="form-column">
          <div className="form-card">
            <h2>Compare Assets</h2>
            
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assets">Assets (comma separated)</label>
              <input
                type="text"
                id="assets"
                className="form-input"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                placeholder="e.g. Gold, NASDAQ, BIST100"
              />
              <small className="hint">BTC is automatically included in the comparison</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="compare-button"
              onClick={fetchData}
              disabled={loading || !startDate || !assets}
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="results-column">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching comparison data...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="results-grid">
              {data.map((item, idx) => {
                const isBTC = item.asset === "BTC";
                const ticker = isBTC ? "BTC" : item.return_percent && Object.keys(item.return_percent)[0];
                const returnPercent = isBTC ? item.return_percent : item.return_percent?.[ticker];
                
                const getValue = (obj, key) => obj && obj[key] !== undefined ? obj[key] : null;
                const startPrice = isBTC ? item.start_price : getValue(item.start_price, ticker);
                const endPrice = isBTC ? item.end_price : getValue(item.end_price, ticker);
                const unitsBought = isBTC ? item.units_bought : getValue(item.units_bought, ticker);
                const finalValue = isBTC ? item.final_value : getValue(item.final_value, ticker);
                const profit = isBTC ? item.profit : getValue(item.profit, ticker);

                return (
                  <div key={idx} className="asset-card">
                    <div className="asset-header">
                      <h3>{item.asset}</h3>
                      <span className={`return-badge ${getReturnClass(returnPercent)}`}>
                        {returnPercent !== undefined ? `${parseFloat(returnPercent).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="asset-details">
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span>{item.start_date || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">End Date:</span>
                        <span>{item.end_date || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Start Price:</span>
                        <span>{formatValue(startPrice, true)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">End Price:</span>
                        <span>{formatValue(endPrice, true)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Units Bought:</span>
                        <span>{formatValue(unitsBought, false, 4)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Final Value:</span>
                        <span>{formatValue(finalValue, true)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Profit/Loss:</span>
                        <span className={getReturnClass(profit)}>
                          {formatValue(profit, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No comparison data yet</h3>
              <p>Enter a date and assets to compare their performance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitComparison;
