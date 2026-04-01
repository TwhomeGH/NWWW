import yfinance as yf

# 抓取台指期 (WTX00) 的資料
ticker = yf.Ticker("WTX00")
data = ticker.history(period="1d", interval="1m")
print(data.tail())
