import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function fetchYahooFuture() {
  const url = "https://tw.stock.yahoo.com/future/WTX%26";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) " +
                    "Chrome/122.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const rawText = $("#main-1-FutureHeader-Proxy").text().trim();
  return parseFutureText(rawText);
}

function parseFutureText(text) {
  const match = text.match(/^(.+?)([\d,]+\.\d{2})(\d+\.\d{2})\(([\d.]+)%\)/);
  if (!match) return null;

  return {
    name: match[1].trim(),
    price: parseFloat(match[2].replace(/,/g, "")),
    change: parseFloat(match[3].replace(/,/g, "")),
    changePercent: parseFloat(match[4])
  };
}
