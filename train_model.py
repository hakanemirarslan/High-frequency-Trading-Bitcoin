import pandas as pd
import numpy as np
import requests
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

def fetch_btc_data(days=90):
    url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
    params = {
        "vs_currency": "usd",
        "days": days  # ← removed 'interval'
    }
    response = requests.get(url, params=params)
    
    try:
        data = response.json()
    except Exception as e:
        print("❌ Error decoding JSON:", e)
        print("Raw response:", response.text)
        return None

    if "prices" not in data:
        print("⚠️ Unexpected response structure:", data)
        return None

    prices = data["prices"]
    df = pd.DataFrame(prices, columns=["timestamp", "price"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.set_index("timestamp")
    return df

# Fetch and plot the data
btc_df = fetch_btc_data(90)
btc_df.plot(figsize=(12, 6), title="BTC/USD Price (Last 90 Days)")
plt.show()

# --- Feature Engineering ---
btc_df['return_1h'] = btc_df['price'].pct_change(periods=1)
btc_df['return_3h'] = btc_df['price'].pct_change(periods=3)
btc_df['return_6h'] = btc_df['price'].pct_change(periods=6)
btc_df['ma_6h'] = btc_df['price'].rolling(window=6).mean()
btc_df['ma_12h'] = btc_df['price'].rolling(window=12).mean()

# Drop missing values from rolling + pct_change
btc_df.dropna(inplace=True)

# --- Create Labels ---
btc_df['future_return'] = btc_df['price'].shift(-3) / btc_df['price'] - 1

def label(row):
    if row['future_return'] > 0.002:   # > +0.2%
        return 1   # BUY
    elif row['future_return'] < -0.002:  # < -0.2%
        return -1  # SELL
    else:
        return 0   # HOLD

btc_df['signal'] = btc_df.apply(label, axis=1)
btc_df.dropna(inplace=True)

print("\n🧠 Feature matrix ready:")
print(btc_df[['price', 'return_1h', 'return_3h', 'ma_6h', 'ma_12h', 'signal']].tail())

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Define input features and label
features = ['return_1h', 'return_3h', 'return_6h', 'ma_6h', 'ma_12h']
X = btc_df[features]
y = btc_df['signal']

# Split data into training and test sets (no shuffle because it's time series)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# Train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# Evaluate the model
print("\n📊 Model performance:")
print(classification_report(y_test, y_pred))

# --- Save the model to disk ---
import joblib

joblib.dump(model, "btc_predictor.pkl")
print("✅ Model saved as btc_predictor.pkl")
