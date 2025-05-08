import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

def get_yfinance_data(symbol, period="90d", interval="1d"):
    data = yf.download(symbol, period=period, interval=interval)
    return data["Close"]

def get_btc_data(path=BTC_CSV_PATH):
    df = pd.read_csv(path, parse_dates=["timestamp"])
    df = df.set_index("timestamp").resample("1D").last()
    return df["price"].dropna()

# --- DATA PREPARATION ---

def prepare_comparison_dataframe():
    data = {}

    # Load BTC
    btc_series = get_btc_data()
    btc_series = btc_series[-DAYS:]
    data["BTC"] = btc_series

    # # Load others from yfinance
    # for name, symbol in ASSET_SYMBOLS.items():
    #     try:
    #         series = get_yfinance_data(symbol)
    #         data[name] = series
    #     except Exception as e:
    #         print(f"Error fetching {name}: {e}")

    for name, symbol in ASSET_SYMBOLS.items():
        try:
            series = get_yfinance_data(symbol)
            data[name] = series.squeeze()  # FIX: Ensure 1D
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

# --- API SETUP (Optional) ---

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

comparison_df = None
normalized_df = None

@app.on_event("startup")
def startup_event():
    global comparison_df, normalized_df
    comparison_df = prepare_comparison_dataframe()
    normalized_df = normalize(comparison_df)
    plot_comparison(normalized_df)

@app.get("/comparison")
def get_normalized_comparison():
    if normalized_df is not None:
        return normalized_df.reset_index().to_dict(orient="records")
    return {"error": "Data not available"}

# --- MAIN ENTRY POINT ---

if __name__ == "__main__":
    # Run as script or start API
    comparison_df = prepare_comparison_dataframe()
    normalized_df = normalize(comparison_df)
    plot_comparison(normalized_df)

    # Uncomment to run the API
    uvicorn.run(app, host="0.0.0.0", port=8001)
