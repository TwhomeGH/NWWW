const { app, BrowserWindow } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

let intervalId; // 全域變數，方便清理





// ✅ 直接抓 Yahoo JSON API
async function fetchYahooFutureJSON(symbol) {
  const url = `https://tw.stock.yahoo.com/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;symbols=%5B%22${symbol}%22%5D;type=tick?bkt=twstock-pc-lumosv2-migration-rampup&device=desktop&ecma=modern&feature=enableGAMAds%2CenableGAMEdgeToEdge%2CenableEvPlayer%2CuseCG%2CuseCGV2%2CuseLumosV2Stock&intl=tw&lang=zh-Hant-TW&partner=none&region=TW&site=finance&tz=Asia%2FTaipei&ver=1.4.837&returnMeta=true`;

  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const data = await response.json();

  console.log(`抓取 ${symbol} 成功:`, data);
  // ✅ 解析 JSON，取出需要的值
  const chart = data?.data?.[0]?.chart;
  const quote = chart?.quote;
  if (!chart || !chart.indicators) return null;
  if (!quote) return null;


  return {
    name: chart.meta?.name,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent
  };
}


function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('index.html');

  const fetchData = async () => {
    try {
      const [data1, data2] = await Promise.all([
        fetchYahooFutureJSON("WTX00") ,
        fetchYahooFutureJSON("WTX%26")
      ]);
      console.log("抓取成功:", data1, data2);

      if (data1) win.webContents.send('future-data', data1);
      if (data2) win.webContents.send('future-data-nt2', data2);
    } catch (err) {
      console.error("抓取失敗:", err.message);
    }
  };

  intervalId = setInterval(fetchData, 1000);

  // ✅ 視窗銷毀時清理 interval
  win.on('closed', () => {
    clearInterval(intervalId);
  });
}

// ✅ 所有視窗關閉時強制結束
app.on('window-all-closed', () => {
  clearInterval(intervalId);
  process.exit(0); // ✅ 強制殺掉主行程
});

app.whenReady().then(createWindow);
