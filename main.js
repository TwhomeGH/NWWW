const { app, BrowserWindow } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
//const cheerio = require('cheerio'); // ✅ 已經改用 JSON API，不需要 cheerio 了
const { getPrid } = require('./test33.js'); // ✅ 引入 getPrid 函式



let intervalId; // 全域變數，方便清理





// ✅ 直接抓 Yahoo JSON API
async function fetchYahooFutureJSON(symbol) {

  const prid = await getPrid(symbol);
  console.log(`取得 prid: ${prid}，準備抓取 ${symbol} 的資料...`);
  const url = `https://tw.stock.yahoo.com/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;symbols=%5B%22${symbol}%22%5D;type=tick?bkt=twstock-pc-lumosv2-migration-rampup&device=desktop&ecma=modern&feature=enableGAMAds%2CenableGAMEdgeToEdge%2CenableEvPlayer%2CuseCG%2CuseCGV2%2CuseLumosV2Stock&intl=tw&lang=zh-Hant-TW&partner=none&region=TW&site=finance&tz=Asia%2FTaipei&ver=1.4.837&returnMeta=true&prid=${prid}`;

  const response = await fetch(url, 
    {
        "headers": {
        "accept": "*/*",
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "x-webp": "1",
        "cookie": "tbla_id=a434209c-c35c-4f95-9e19-88e893eecb3a-tuctbfe8227; axids=gam=y-_evcr2xE2uI09TVZirRA7NIsHpahOYBf~A&dv360=eS1DVjNFbi45RTJ1SEtCcjg5bEZnUEVuZU1sZmQ4akt5Vn5B&ydsp=y-HWGyCVxE2uIHSaczhNW7zBW2TVSuTIxJ~A&tbla=y-9gFKAjRE2uIzLFgwuRVBtrxo4CBxtK8y~A; B=fs5o771kdhgt6&b=3&s=23; _ga=GA1.1.223670684.1759036108; _ga_C711FSMBJS=GS2.1.s1759036335$o1$g1$t1759036440$j60$l0$h0; GUC=AQEBCAFpsK1p20If9QRT&s=AQAAADBRQZ2S&g=aa9kBg; A1=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; A3=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; _ygpc=MwE2AjECMTc3MzE4ODcwNAIyNgEw; gpp=DBAA; gpp_sid=-1; cmp=t=1775024710&j=0&u=1---; A1S=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; _ga_9K542N3JEE=GS2.1.s1775063149$o2$g1$t1775063263$j60$l0$h0; _ga_SV1HSD0SMT=GS2.1.s1775063150$o5$g1$t1775063481$j60$l0$h0; _ga_T9N0HDPP58=GS2.1.s1775063482$o9$g1$t1775063648$j59$l0$h0",
        "Referer": "https://tw.stock.yahoo.com/future/WTX&"
      },
      "method": "GET"

    }
  );
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
