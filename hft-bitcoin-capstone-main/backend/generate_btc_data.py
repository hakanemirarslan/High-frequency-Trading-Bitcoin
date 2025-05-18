import requests
import pandas as pd

def fetch_and_save_btc_data(days=90, filename="btc_data.csv"):
    url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
    params = {
        "vs_currency": "usd",
        "days": days
    }
    response = requests.get(url, params=params)
    data = response.json()

    if "prices" not in data:
        raise Exception("Prices key not found in API response.")

    prices = data["prices"]
    df = pd.DataFrame(prices, columns=["timestamp", "price"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.set_index("timestamp")
    df.to_csv(filename)
    print(f"✅ Saved BTC data to {filename}")

if __name__ == "__main__":
    fetch_and_save_btc_data()
