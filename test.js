const RES = await fetch("https://tw.stock.yahoo.com/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;symbols=%5B%22WTX%26%22%5D;type=tick?bkt=twstock-pc-lumosv2-migration-rampup&device=desktop&ecma=modern&feature=enableGAMAds%2CenableGAMEdgeToEdge%2CenableEvPlayer%2CuseCG%2CuseCGV2%2CuseLumosV2Stock&intl=tw&lang=zh-Hant-TW&partner=none&prid=0maqfd5ksqkiv&region=TW&site=finance&tz=Asia%2FTaipei&ver=1.4.837&returnMeta=true", {
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
});

const DATA = await RES.json();

console.log("抓取成功:", DATA);