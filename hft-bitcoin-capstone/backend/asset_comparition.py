# # import yfinance as yf
# # import pandas as pd
# # import matplotlib.pyplot as plt
# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware
# # import uvicorn
# # from datetime import datetime

# # # --- CONFIGURATION ---

# # ASSET_SYMBOLS = {
# #     "Gold": "GC=F",
# #     "NASDAQ": "^NDX",
# #     "BIST100": "XU100.IS",
# #     "USD": "DX-Y.NYB",
# # }

# # BTC_CSV_PATH = "btc_data.csv"  # Assumes existing BTC data
# # DAYS = 90
# # CHART_OUTPUT_PATH = "comparison_chart.png"

# # # --- FETCH FUNCTIONS ---

# # def get_yfinance_data(symbol, period="90d", interval="1d"):
# #     data = yf.download(symbol, period=period, interval=interval)
# #     return data["Close"]

# # def get_btc_data(path=BTC_CSV_PATH):
# #     df = pd.read_csv(path, parse_dates=["timestamp"])
# #     df = df.set_index("timestamp").resample("1D").last()
# #     return df["price"].dropna()

# # # --- DATA PREPARATION ---

# # def prepare_comparison_dataframe():
# #     data = {}

# #     # Load BTC
# #     btc_series = get_btc_data()
# #     btc_series = btc_series[-DAYS:]
# #     data["BTC"] = btc_series

# #     # # Load others from yfinance
# #     # for name, symbol in ASSET_SYMBOLS.items():
# #     #     try:
# #     #         series = get_yfinance_data(symbol)
# #     #         data[name] = series
# #     #     except Exception as e:
# #     #         print(f"Error fetching {name}: {e}")

# #     for name, symbol in ASSET_SYMBOLS.items():
# #         try:
# #             series = get_yfinance_data(symbol)
# #             data[name] = series.squeeze()  # FIX: Ensure 1D
# #         except Exception as e:
# #             print(f"Error fetching {name}: {e}")

# #     df = pd.DataFrame(data).dropna()
# #     return df

# # def normalize(df):
# #     return df / df.iloc[0] * 100

# # # --- PLOTTING ---

# # def plot_comparison(normalized_df):
# #     plt.figure(figsize=(12, 6))
# #     for column in normalized_df.columns:
# #         plt.plot(normalized_df.index, normalized_df[column], label=column)
# #     plt.title("Asset Performance Comparison (Last 90 Days)")
# #     plt.ylabel("Normalized Price (Start = 100)")
# #     plt.xlabel("Date")
# #     plt.legend()
# #     plt.grid(True)
# #     plt.tight_layout()
# #     plt.savefig(CHART_OUTPUT_PATH)
# #     print(f"Chart saved to {CHART_OUTPUT_PATH}")


# # # --- API SETUP (Optional) ---

# # app = FastAPI()
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # comparison_df = None
# # normalized_df = None

# # @app.on_event("startup")
# # def startup_event():
# #     global comparison_df, normalized_df
# #     comparison_df = prepare_comparison_dataframe()
# #     normalized_df = normalize(comparison_df)
# #     plot_comparison(normalized_df)

# # @app.get("/comparison")
# # def get_normalized_comparison():
# #     if normalized_df is not None:
# #         return normalized_df.reset_index().to_dict(orient="records")
# #     return {"error": "Data not available"}

# # # --- RETURN ON INVESMENT FUNCTIONALITY ---

# # def investment_comparison():
# #     print("\n--- BTC Investment Comparison ---")
# #     print("Available assets to compare:", list(ASSET_SYMBOLS.keys()))
# #     selected = input("Enter asset names to compare with BTC (comma-separated): ")
# #     assets = [a.strip() for a in selected.split(",") if a.strip() in ASSET_SYMBOLS]

# #     if not assets:
# #         print("No valid assets selected.")
# #         return

# #     start_date = input("Enter starting date (YYYY-MM-DD): ")
# #     try:
# #         start_dt = pd.to_datetime(start_date)
# #     except ValueError:
# #         print("Invalid date format.")
# #         return

# #     # Load BTC data
# #     btc = get_btc_data()
# #     btc = btc[btc.index >= start_dt]
# #     if btc.empty:
# #         print("No BTC data available from the given date.")
# #         return

# #     btc_start_price = btc.iloc[0]
# #     btc_end_price = btc.iloc[-1]
# #     btc_profit = (btc_end_price / btc_start_price) * 1000 - 1000

# #     print(f"\nBTC: Start Price = {btc_start_price:.2f}, End Price = {btc_end_price:.2f}")
# #     print(f"BTC Profit: ${btc_profit:.2f}")

# #     best_asset = "BTC"
# #     best_profit = btc_profit

# #     for asset in assets:
# #         symbol = ASSET_SYMBOLS[asset]
# #         series = get_yfinance_data(symbol, period="max", interval="1d")
# #         series = series[series.index >= start_dt]

# #         if series.empty:
# #             print(f"\n{asset}: No data available from {start_date}")
# #             continue

# #         start_price = series.iloc[0]
# #         end_price = series.iloc[-1]
# #         profit = (end_price / start_price) * 1000 - 1000

# #         print(f"\n{asset}: Start Price = {start_price:.2f}, End Price = {end_price:.2f}")
# #         print(f"{asset} Profit: ${profit:.2f}")

# #         if profit > best_profit:
# #             best_profit = profit
# #             best_asset = asset

# #     print(f"\n--- SUMMARY ---")
# #     print(f"Best investment since {start_date}: {best_asset} with a profit of ${best_profit:.2f}") 

# # # --- MAIN ENTRY POINT ---

# # if __name__ == "__main__":
# #     # Run as script or start API
# #     comparison_df = prepare_comparison_dataframe()
# #     normalized_df = normalize(comparison_df)
# #     plot_comparison(normalized_df)
# #     #investment_comparison()

# #     # Uncomment to run the API
# #     uvicorn.run(app, host="0.0.0.0", port=8001)

# ### 🔧 asset_comparition.py (REFACTORED AS PURE UTILITY MODULE)

# import yfinance as yf
# import pandas as pd
# import matplotlib.pyplot as plt
# from datetime import datetime
# from typing import Callable
# from generate_btc_data import fetch_and_save_btc_data  # or however you access `get_btc_data`


# # --- CONFIGURATION ---

# ASSET_SYMBOLS = {
#     "Gold": "GC=F",
#     "NASDAQ": "^NDX",
#     "BIST100": "XU100.IS",
#     "USD": "DX-Y.NYB",
# }

# BTC_CSV_PATH = "btc_data.csv"  # Assumes existing BTC data
# DAYS = 90
# CHART_OUTPUT_PATH = "comparison_chart.png"

# # --- FETCH FUNCTIONS ---

# def get_yfinance_data(symbol, period="90d", interval="1d"):
#     data = yf.download(symbol, period=period, interval=interval)
#     return data["Close"]

# def get_btc_data(path=BTC_CSV_PATH):
#     df = pd.read_csv(path, parse_dates=["timestamp"])
#     df = df.set_index("timestamp").resample("1D").last()
#     return df["price"].dropna()

# # --- DATA PREPARATION ---

# def prepare_comparison_dataframe():
#     data = {}

#     btc_series = get_btc_data()
#     btc_series = btc_series[-DAYS:]
#     data["BTC"] = btc_series

#     for name, symbol in ASSET_SYMBOLS.items():
#         try:
#             series = get_yfinance_data(symbol)
#             data[name] = series.squeeze()
#         except Exception as e:
#             print(f"Error fetching {name}: {e}")

#     df = pd.DataFrame(data).dropna()
#     return df

# def normalize(df):
#     return df / df.iloc[0] * 100

# # --- PLOTTING ---

# def plot_comparison(normalized_df):
#     plt.figure(figsize=(12, 6))
#     for column in normalized_df.columns:
#         plt.plot(normalized_df.index, normalized_df[column], label=column)
#     plt.title("Asset Performance Comparison (Last 90 Days)")
#     plt.ylabel("Normalized Price (Start = 100)")
#     plt.xlabel("Date")
#     plt.legend()
#     plt.grid(True)
#     plt.tight_layout()
#     plt.savefig(CHART_OUTPUT_PATH)
#     print(f"Chart saved to {CHART_OUTPUT_PATH}")

# # --- INVESTMENT COMPARISON USING MODEL SIGNALS ---

# # def investment_comparison(model, create_features_fn):
# #     print("\n--- BTC Investment Simulation Based on Model ---")
# #     btc = get_btc_data()
# #     btc = btc[-DAYS:]

# #     usd = 1000
# #     btc_holdings = 0
# #     price_history = []

# #     for ts, price in btc.items():
# #         price_history.append(price)
# #         features = create_features_fn(price_history)
# #         if features is None:
# #             continue
# #         try:
# #             signal = model.predict(features)[0]
# #         except:
# #             continue

# #         if signal == 1 and usd >= price:
# #             btc_holdings += 1
# #             usd -= price
# #             print(f"BUY at {price:.2f} on {ts.date()}")
# #         elif signal == -1 and btc_holdings > 0:
# #             btc_holdings -= 1
# #             usd += price
# #             print(f"SELL at {price:.2f} on {ts.date()}")

# #     final_value = usd + btc_holdings * btc.iloc[-1]
# #     print(f"\nFinal Portfolio Value: ${final_value:.2f} (Start: $1000)")


# def investment_comparison(
#     model,
#     create_features_fn: Callable[[list], pd.DataFrame],
#     days: int = DAYS,
#     starting_cash: float = 1000.0,
#     verbose: bool = True
# ) -> dict:
#     if verbose:
#         print("\n--- BTC Investment Simulation Based on Model ---")

#     btc = get_btc_data()
#     btc = btc[-days:]

#     usd = starting_cash
#     btc_holdings = 0
#     price_history = []

#     for ts, price in btc.items():
#         price_history.append(price)
#         features = create_features_fn(price_history)
#         if features is None:
#             continue

#         try:
#             signal = model.predict(features)[0]  # Expect -1, 0, 1
#         except Exception as e:
#             if verbose:
#                 print(f"⚠️ Prediction failed at {ts.date()}: {e}")
#             continue

#         if signal == 1 and usd >= price:
#             btc_holdings += 1
#             usd -= price
#             if verbose:
#                 print(f"✅ BUY at {price:.2f} on {ts.date()}")
#         elif signal == -1 and btc_holdings > 0:
#             btc_holdings -= 1
#             usd += price
#             if verbose:
#                 print(f"❌ SELL at {price:.2f} on {ts.date()}")
#         elif verbose:
#             print(f"⚖️ HOLD on {ts.date()} (USD: {usd:.2f}, BTC: {btc_holdings})")

#     final_price = btc.iloc[-1]
#     final_value = usd + btc_holdings * final_price

#     if verbose:
#         print(f"\n💼 Final Portfolio Value: ${final_value:.2f} (Start: ${starting_cash:.2f})")

#     return {
#         "final_value": round(final_value, 2),
#         "cash_remaining": round(usd, 2),
#         "btc_remaining": btc_holdings,
#         "btc_final_price": round(final_price, 2),
#         "days": days,
#         "start_cash": starting_cash
#     }

# # --- RUN STANDALONE CHART ---

# if __name__ == "__main__":
#     df = prepare_comparison_dataframe()
#     normalized_df = normalize(df)
#     plot_comparison(normalized_df)

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
