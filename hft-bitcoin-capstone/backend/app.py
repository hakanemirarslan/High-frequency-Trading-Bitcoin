import threading
import time
from datetime import datetime
import requests
import joblib
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import train_model
import asset_comparition as ac
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import atexit
import os
from typing import Dict
from fastapi import HTTPException
from datetime import datetime
from fastapi import HTTPException


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("btc_predictor.pkl")
print("🧠 Model loaded: btc_predictor.pkl")

portfolio = {'usd': 10000, 'btc': 0}
price_history = []

# -------------------------------
# Helper Functions
# -------------------------------

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

def get_live_price():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    try:
        response = requests.get(url)
        data = response.json()
        return float(data["bitcoin"]["usd"])
    except Exception as e:
        print("❌ Error fetching price:", e)
        return None

def execute_trade(signal, price):
    global portfolio
    if signal == 1 and portfolio['usd'] >= price:
        portfolio['btc'] += 1
        portfolio['usd'] -= price
        print(f"✅ BUY at ${price:.2f}")
    elif signal == -1 and portfolio['btc'] >= 1:
        portfolio['btc'] -= 1
        portfolio['usd'] += price
        print(f"❌ SELL at ${price:.2f}")
    else:
        print(f"⚠️ HOLD - USD: {portfolio['usd']:.2f}, BTC: {portfolio['btc']}")

# -------------------------------
# Trading Bot
# -------------------------------

def trading_loop():
    print("📡 Starting trading loop...")
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

        time.sleep(10)

# -------------------------------
# FastAPI Endpoints
# -------------------------------

last_valid_price = None
last_valid_prediction = None

@app.get("/predict")
def predict():
    global last_valid_price, last_valid_prediction
    price = get_live_price()
    valid_price = price is not None and price == price and price > 0

    features = None
    prediction = "WAITING"
    if valid_price:
        price_history.append(price)
        features = create_features(price_history)
        if features is not None:
            try:
                signal = model.predict(features)[0]
                prediction = ["SELL", "HOLD", "BUY"][signal + 1]
            except Exception as e:
                print(f"Prediction error: {e}")
                prediction = "WAITING"

    if valid_price and prediction != "WAITING":
        last_valid_price = price
        last_valid_prediction = prediction

    response_price = last_valid_price if last_valid_price is not None else price
    response_prediction = last_valid_prediction if last_valid_prediction is not None else prediction

    return {
        "price": response_price,
        "prediction": response_prediction,
        "portfolio": portfolio
    }

@app.get("/chart")
def chart():
    btc_df = train_model.fetch_btc_data(90)
    plt.figure(figsize=(12, 6))
    plt.plot(btc_df.index, btc_df['price'], label="BTC/USD Price")
    plt.title("BTC/USD Price (Last 90 Days)")
    plt.xlabel("Date")
    plt.ylabel("Price (USD)")
    plt.legend()
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    return StreamingResponse(buf, media_type="image/png")

@app.get("/comparison")
def comparison():
    df = ac.prepare_comparison_dataframe()
    norm = ac.normalize(df)
    ac.plot_comparison(norm)
    return StreamingResponse(open("comparison_chart.png", "rb"), media_type="image/png")

@app.get("/investment")
def get_investment_comparison(assets: str, start_date: str):
    try:
        asset_list = [a.strip() for a in assets.split(",")]

        # Run buy and hold simulation for each asset with $1000
        buy_hold_results = ac.buy_and_hold_multiple_assets(asset_list, start_date, starting_cash=1000)

        # Optionally, also run your BTC model simulation (if BTC is in assets)
        btc_simulation = None
        if "BTC" in asset_list:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            today = datetime.today()
            delta_days = (today - start_dt).days
            if delta_days <= 0:
                delta_days = 90

            btc_simulation = ac.investment_comparison(
                model=model,
                create_features_fn=create_features,
                days=delta_days,
                starting_cash=1000,
                verbose=False
            )

        return {
            "buy_and_hold": buy_hold_results,
            "btc_model_simulation": btc_simulation
        }

    except Exception as e:
        print("❌ ERROR in /investment:", e)
        raise HTTPException(status_code=500, detail=str(e))


def cleanup():
    try:
        if os.path.exists("btc_chart.png"):
            os.remove("btc_chart.png")
            print("🗑️ btc_chart.png deleted on exit")
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")

atexit.register(cleanup)

if __name__ == "__main__":
    bot_thread = threading.Thread(target=trading_loop, daemon=True)
    bot_thread.start()
    uvicorn.run(app, host="0.0.0.0", port=8000)
###------------OLD-------------####
