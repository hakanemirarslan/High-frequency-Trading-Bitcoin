import requests
import numpy as np
import time
from datetime import datetime
import joblib
import pandas as pd

model = joblib.load("btc_predictor.pkl")
print("🧠 Model loaded: btc_predictor.pkl")
portfolio = {'usd': 10000, 'btc': 0}
price_history = []

def create_features(prices):
    if len(prices) < 13:
        return None

    df = pd.DataFrame(prices[-13:], columns=["price"])
    df["return_1h"] = df["price"].pct_change(periods=1)
    df["return_3h"] = df["price"].pct_change(periods=3)
    df["return_6h"] = df["price"].pct_change(periods=6)
    df["ma_6h"] = df["price"].rolling(window=6).mean()
    df["ma_12h"] = df["price"].rolling(window=12).mean()
    df.dropna(inplace=True)

    if df.empty:
        return None

    latest = df.iloc[-1][["return_1h", "return_3h", "return_6h", "ma_6h", "ma_12h"]].values
    return latest.reshape(1, -1)


def execute_trade(signal, price):
    global portfolio
    if signal == "BUY" and portfolio['usd'] >= price:
        portfolio['btc'] += 1
        portfolio['usd'] -= price
        print(f"✅ BUY at ${price:.2f}")
    elif signal == "SELL" and portfolio['btc'] >= 1:
        portfolio['btc'] -= 1
        portfolio['usd'] += price
        print(f"❌ SELL at ${price:.2f}")
    else:
        print(f"⚠️ HOLD - USD: {portfolio['usd']:.2f}, BTC: {portfolio['btc']}")

def get_live_price():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    try:
        response = requests.get(url)
        data = response.json()
        return float(data["bitcoin"]["usd"])
    except Exception as e:
        print("❌ Error fetching price:", e)
        return None

if __name__ == "__main__":
    print("📡 Starting Coingecko polling loop...")

    while True:
        price = get_live_price()
        if price is not None:
            ts = datetime.now()
            print(f"[{ts.strftime('%H:%M:%S')}] Price: ${price:.2f}")
            price_history.append(price)

            features = create_features(price_history)
            if features is not None:
                signal = model.predict(features)[0]
                print(f"🔮 Prediction: {['SELL','HOLD','BUY'][signal+1]}")
                execute_trade(signal, price)

        time.sleep(10)  # Polling every 10 seconds
