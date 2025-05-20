import React, { useState } from "react";
import axios from "axios";
import "../styles/AssetComparison.css";

const ProfitComparision = () => {
  const [startDate, setStartDate] = useState("");
  const [assets, setAssets] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const queryAssets = assets
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a !== "")
        .join(",");

      const response = await axios.get(
        `http://localhost:8000/investment?assets=${queryAssets},BTC&start_date=${startDate}`
      );

      setData(response.data.buy_and_hold || []);
      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching investment data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      <h1 className="text-4xl font-bold text-center mb-8 text-white-700 drop-shadow">
        💰 Asset Profit Comparison
      </h1>

      {/* Form Section */}
      {!submitted && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="date"
              className="border rounded p-2 flex-1 text-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="text"
              className="border rounded p-2 flex-1 text-lg"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
              placeholder="Assets (e.g. Gold,NASDAQ,BIST100,BTC)"
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-lg rounded shadow hover:from-blue-700 hover:to-purple-700 transition"
              onClick={fetchData}
              disabled={!startDate || !assets}
            >
              🚀 Compare
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-xl text-center text-gray-600">Loading data...</p>
      )}

      {/* Result Section */}
      {!loading && submitted && data.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((item, idx) => {
            const isBTC = item.asset === "BTC";

            const ticker = isBTC
              ? "BTC"
              : item.return_percent && Object.keys(item.return_percent)[0];

            const returnPercent = isBTC
              ? item.return_percent
              : item.return_percent?.[ticker];

            const getValue = (obj, key) =>
              obj && obj[key] !== undefined ? obj[key] : null;

            return (
              <div
                className="asset-comparison-page bg-white border rounded-xl p-6 shadow-md hover:shadow-xl transition"
                key={idx}
              >
                <h2 className="text-2xl font-semibold text-indigo-700 mb-2">
                  {item.asset}
                </h2>
                <div className="space-y-1 text-lg">
                  <p>
                    <strong>📅 Start Date:</strong> {item.start_date || "N/A"}
                  </p>
                  <p>
                    <strong>📅 End Date:</strong> {item.end_date || "N/A"}
                  </p>
                  <p>
                    <strong>💵 Start Price:</strong>{" "}
                    {isBTC
                      ? `$${item.start_price?.toFixed(2) ?? "N/A"}`
                      : getValue(item.start_price, ticker) !== null
                      ? `$${getValue(item.start_price, ticker)}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>💵 End Price:</strong>{" "}
                    {isBTC
                      ? `$${item.end_price?.toFixed(2) ?? "N/A"}`
                      : getValue(item.end_price, ticker) !== null
                      ? `$${getValue(item.end_price, ticker)}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>📦 Units Bought:</strong>{" "}
                    {isBTC
                      ? item.units_bought?.toFixed(4) ?? "N/A"
                      : getValue(item.units_bought, ticker) !== null
                      ? getValue(item.units_bought, ticker).toFixed(4)
                      : "N/A"}
                  </p>
                  <p>
                    <strong>💰 Final Value:</strong>{" "}
                    {isBTC
                      ? `$${item.final_value?.toFixed(2) ?? "N/A"}`
                      : getValue(item.final_value, ticker) !== null
                      ? `$${getValue(item.final_value, ticker).toFixed(2)}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>📈 Profit:</strong>{" "}
                    <span
                      className={
                        returnPercent >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {isBTC
                        ? `$${item.profit?.toFixed(2) ?? "N/A"}`
                        : getValue(item.profit, ticker) !== null
                        ? `$${getValue(item.profit, ticker).toFixed(2)}`
                        : "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>📊 Return:</strong>{" "}
                    <span
                      className={
                        returnPercent >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {returnPercent !== undefined
                        ? `${returnPercent.toFixed(2)}%`
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!loading && submitted && data.length === 0 && (
        <p className="text-xl text-center text-gray-500">
          No data found for the selected assets or date.
        </p>
      )}
    </div>
  );
};

export default ProfitComparision;
