# 🔁 High-Frequency Bitcoin Trading with Machine Learning

This project simulates a real-time high-frequency trading (HFT) strategy for Bitcoin using a machine learning model trained on historical price data. It fetches live BTC prices from the Coingecko API, processes features in real-time, and makes buy/sell/hold decisions based on a trained classifier model.

---

## 📌 Features

- ✅ Real-time Bitcoin price fetching via Coingecko API
- 🧠 Trained ML model (RandomForestClassifier) to predict trade signals
- 🔮 Predicts `BUY`, `SELL`, or `HOLD` every few seconds
- 💸 Simulated portfolio to track BTC/USD balances
- 💾 Modular structure: `main.py` for live loop, `train_model.py` for training
- 🔐 No API key needed (free & public data)

---

## 🧠 Machine Learning Model

The model is trained on 90 days of hourly BTC/USD data. It uses:

- Price returns (`1h`, `3h`, `6h`)
- Moving averages (`6h`, `12h`)
- Custom label logic (future return > ±0.2%)

You can train your own model using:

```bash
python train_model.py

## 📂 File Structure

├── main.py               # Real-time trading simulation
├── train_model.py        # ML training pipeline (Coingecko + sklearn)
├── btc_predictor.pkl     # Trained model used in real-time
├── requirements.txt      # All required packages
├── trades.csv (optional) # Trade log file (if enabled)
└── README.md             # You're reading it!

##  🚀 Getting Started

git clone https://github.com/yourusername/bitcoin-hft-ml.git
cd bitcoin-hft-ml

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python train_model.py

python main.py

## 📈 Sample Output

📡 Starting Coingecko polling loop...
🧠 Model loaded: btc_predictor.pkl
[12:01:01] Price: $90832.00
🔮 Prediction: BUY
✅ BUY at $90832.00
