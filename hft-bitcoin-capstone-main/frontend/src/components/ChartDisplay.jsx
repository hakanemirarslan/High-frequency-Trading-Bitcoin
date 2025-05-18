import React from "react";
import { Oval } from "react-loader-spinner";
import "./ChartDisplay.css";

const ChartDisplay = ({ chartUrl }) => {
  if (chartUrl === null) {
    return (
      <div className="chart-loading">
        <Oval height={60} width={60} color="#3b82f6" ariaLabel="loading" />
        <p>Loading chart...</p>
      </div>
    );
  }
  if (chartUrl === "error") {
    return <div className="chart-error">Chart could not be loaded.</div>;
  }
  return (
    <div className="chart-image-container">
      <img src={chartUrl} alt="BTC Chart" className="chart-image" />
    </div>
  );
};

export default ChartDisplay;
