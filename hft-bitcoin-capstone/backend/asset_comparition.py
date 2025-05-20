###--------OLD--------#####
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
from typing import Callable

# --- CONFIGURATION ---

ASSET_SYMBOLS = {
    "Gold": "GC=F",
    "NASDAQ": "^NDX",
    "BIST100": "XU100.IS",
    "USD": "DX-Y.NYB",
}

BTC_CSV_PATH = "btc_data.csv"  # Assumes existing BTC data
DAYS = 90
CHART_OUTPUT_PATH = "comparison_chart.png"

# --- FETCH FUNCTIONS ---

def get_yfinance_data(symbol, start_date=None, period="90d", interval="1d"):
    if start_date:
        data = yf.download(symbol, start=start_date, interval=interval)
    else:
        data = yf.download(symbol, period=period, interval=interval)
    return data["Close"]

def get_btc_data(path=BTC_CSV_PATH, start_date=None):
    df = pd.read_csv(path, parse_dates=["timestamp"])
    df = df.set_index("timestamp").resample("1D").last()
    series = df["price"].dropna()
    if start_date:
        series = series[series.index >= pd.to_datetime(start_date)]
    return series

# --- DATA PREPARATION ---

def prepare_comparison_dataframe():
    data = {}

    btc_series = get_btc_data()
    btc_series = btc_series[-DAYS:]
    data["BTC"] = btc_series

    for name, symbol in ASSET_SYMBOLS.items():
        try:
            series = get_yfinance_data(symbol)
            data[name] = series.squeeze()
        except Exception as e:
            print(f"Error fetching {name}: {e}")

    df = pd.DataFrame(data).dropna()
    return df

def normalize(df):
    return df / df.iloc[0] * 100

# --- PLOTTING ---

def plot_comparison(normalized_df):
    plt.figure(figsize=(12, 6))
    for column in normalized_df.columns:
        plt.plot(normalized_df.index, normalized_df[column], label=column)
    plt.title("Asset Performance Comparison (Last 90 Days)")
    plt.ylabel("Normalized Price (Start = 100)")
    plt.xlabel("Date")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(CHART_OUTPUT_PATH)
    print(f"Chart saved to {CHART_OUTPUT_PATH}")

# --- BUY AND HOLD INVESTMENT SIMULATION ---

def simple_buy_and_hold(asset: str, start_date: str, starting_cash: float = 1000.0) -> dict:
    """
    Simulate buying $starting_cash worth of 'asset' at start_date and holding until the latest price.
    Returns detailed investment results.
    """
    start_dt = pd.to_datetime(start_date)
    if asset == "BTC":
        prices = get_btc_data(start_date=start_dt)
    else:
        symbol = ASSET_SYMBOLS.get(asset)
        if not symbol:
            raise ValueError(f"Unknown asset symbol for '{asset}'")
        prices = get_yfinance_data(symbol, start_date=start_date)

    if prices.empty:
        raise ValueError(f"No price data available for {asset} since {start_date}")

    start_price = prices.iloc[0]
    end_price = prices.iloc[-1]
    units_bought = starting_cash / start_price
    final_value = units_bought * end_price
    profit = final_value - starting_cash
    return {
        "asset": asset,
        "start_date": str(prices.index[0].date()),
        "end_date": str(prices.index[-1].date()),
        "start_price": round(start_price, 2),
        "end_price": round(end_price, 2),
        "units_bought": round(units_bought, 6),
        "final_value": round(final_value, 2),
        "profit": round(profit, 2),
        "return_percent": round((profit / starting_cash) * 100, 2),
    }

def buy_and_hold_multiple_assets(asset_list, start_date, starting_cash=1000):
    results = []
    for asset in asset_list:
        try:
            res = simple_buy_and_hold(asset, start_date, starting_cash)
            results.append(res)
        except Exception as e:
            print(f"Error processing {asset}: {e}")
    return results

# --- EXISTING BTC MODEL-BASED SIMULATION ---

def investment_comparison(
    model,
    create_features_fn: Callable[[list], pd.DataFrame],
    days: int = DAYS,
    starting_cash: float = 1000.0,
    verbose: bool = True
) -> dict:
    if verbose:
        print("\n--- BTC Investment Simulation Based on Model ---")

    btc = get_btc_data()
    btc = btc[-days:]

    usd = starting_cash
    btc_holdings = 0
    price_history = []

    for ts, price in btc.items():
        price_history.append(price)
        features = create_features_fn(price_history)
        if features is None:
            continue

        try:
            signal = model.predict(features)[0]  # Expect -1, 0, 1
        except Exception as e:
            if verbose:
                print(f"⚠️ Prediction failed at {ts.date()}: {e}")
            continue

        if signal == 1 and usd >= price:
            btc_holdings += 1
            usd -= price
            if verbose:
                print(f"✅ BUY at {price:.2f} on {ts.date()}")
        elif signal == -1 and btc_holdings > 0:
            btc_holdings -= 1
            usd += price
            if verbose:
                print(f"❌ SELL at {price:.2f} on {ts.date()}")
        elif verbose:
            print(f"⚖️ HOLD on {ts.date()} (USD: {usd:.2f}, BTC: {btc_holdings})")

    final_price = btc.iloc[-1]
    final_value = usd + btc_holdings * final_price

    if verbose:
        print(f"\n💼 Final Portfolio Value: ${final_value:.2f} (Start: ${starting_cash:.2f})")

    return {
        "final_value": round(final_value, 2),
        "cash_remaining": round(usd, 2),
        "btc_remaining": btc_holdings,
        "btc_final_price": round(final_price, 2),
        "days": days,
        "start_cash": starting_cash
    }


# --- RUN STANDALONE CHART ---

if __name__ == "__main__":
    df = prepare_comparison_dataframe()
    normalized_df = normalize(df)
    plot_comparison(normalized_df)
###--------OLD--------#####
