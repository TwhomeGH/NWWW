
/*** 
 * 這個檔案是用來測試抓取 prid 的，實驗性質，可能會有很多嘗試和錯誤。
 * 
 * 目前的目標是從 https://tw.stock.yahoo.com/future/WTX& 這個頁面抓取 prid，然後在 main.js 裡使用這個 prid 來抓取股價資料。
 * 
 * 注意：這個檔案不會被 main.js 引用，main.js 只會引用 test33.js 裡的 getPrid 函式。
 */
async function getPrid(symbol = "WTX%26") {

  const RES2 = await fetch(`https://tw.stock.yahoo.com/future/${symbol}`, 
     {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-TW,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "cache-control": "max-age=0",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Microsoft Edge\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "tbla_id=a434209c-c35c-4f95-9e19-88e893eecb3a-tuctbfe8227; axids=gam=y-_evcr2xE2uI09TVZirRA7NIsHpahOYBf~A&dv360=eS1DVjNFbi45RTJ1SEtCcjg5bEZnUEVuZU1sZmQ4akt5Vn5B&ydsp=y-HWGyCVxE2uIHSaczhNW7zBW2TVSuTIxJ~A&tbla=y-9gFKAjRE2uIzLFgwuRVBtrxo4CBxtK8y~A; B=fs5o771kdhgt6&b=3&s=23; _ga=GA1.1.223670684.1759036108; _ga_C711FSMBJS=GS2.1.s1759036335$o1$g1$t1759036440$j60$l0$h0; GUC=AQEBCAFpsK1p20If9QRT&s=AQAAADBRQZ2S&g=aa9kBg; A1=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; A3=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; _ygpc=MwE2AjECMTc3MzE4ODcwNAIyNgEw; gpp=DBAA; gpp_sid=-1; cmp=t=1775024710&j=0&u=1---; A1S=d=AQABBKX8BGUCEH53XGygfS7yr-8LmYJWsOUFEgEBCAGtsGnbab2pQDIB_eMDAAcIpfwEZYJWsOU&S=AQAAArZEmOg4eKec8W_SNj7zIpA; _ga_9K542N3JEE=GS2.1.s1775063149$o2$g1$t1775063263$j60$l0$h0; _ga_SV1HSD0SMT=GS2.1.s1775063150$o5$g1$t1775063481$j60$l0$h0; _ga_T9N0HDPP58=GS2.1.s1775063482$o9$g1$t1775063569$j47$l0$h0",
    "Referer": "https://tw.stock.yahoo.com/"
  },
  
  "method": "GET"
}
);


const DATA = await RES2.text();

console.log("抓取成功:", DATA);


const pridMatch = DATA.match(/"prid":"([^"]+)"/);
if (pridMatch) {
  console.log("prid =", pridMatch[1]);
  return pridMatch[1];
}


}


/**
 * 
 * @param {*} symbol 
 * @returns 
 */
async function getFutureData(symbol = "WTX%26") {
  const url = `https://tw.stock.yahoo.com/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;symbols=["${symbol}"];type=tick?bkt=twstock-pc-lumosv2-migration-rampup&device=desktop&ecma=modern&feature=enableGAMAds,enableGAMEdgeToEdge,enableEvPlayer,useCG,useCGV2,useLumosV2Stock&intl=tw&lang=zh-Hant-TW&partner=none&region=TW&site=finance&tz=Asia/Taipei&ver=1.4.837&returnMeta=true`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });

  const data = await res.json();

  // API 回傳的 meta 裡面通常會有 prid

  return { data };
}

// 測試
getFutureData("WTX%26").then(({ prid, data }) => {
  console.log("抓到 prid:", prid);
  console.log("股價資料:", data);
}).catch(err => {
  console.error("抓取失敗:", err);
});


module.exports = { getPrid,getFutureData };


// getFutureData("WTX%26").then(({ data }) => {
//   console.log("股價資料:", data);
// }).catch(err => {
//   console.error("抓取失敗:", err);
// });

// // 測試用
// getPrid("WTX%26").then(prid => {
//   console.log("測試完成，prid =", prid);
// }).catch(err => {
//   console.error("測試失敗:", err);
// });


