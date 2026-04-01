window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleTheme');
  const resetZoomBtn = document.getElementById('resetZoom');
  const body = document.body;

  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const changeCtx = document.getElementById('changeChart').getContext('2d');
  const percentCtx = document.getElementById('percentChart').getContext('2d');

  const MAX_POINTS = 100; // ✅ 只顯示最新 100 筆資料

  const MAX_RANGE = 5;  // ✅ 最大顯示範圍
  const MIN_RANGE = 5; // 最小顯示範圍


function getPaddingRatio(range) {
  if (range < 5) return 0.5;   // 小波動 → 放大顯示
  if (range < 20) return 0.3;  // 中波動 → 適中
  return 0.1;                  // 大波動 → 少 padding
}


function createChart(ctx, titleText, yLabel) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { 
          label: '台指期現貨', 
          data: [], 
          borderColor: '#4e79a7', 
          fill: false, 
      
          spanGaps: true,
          pointRadius: 3,   // 點更大
          borderWidth: 3,   // 線更粗
          tension: 0.4 ,     // 曲線更柔和
          yAxisID: 'y1',
          datalabels: {   // ✅ 改成 datalabels
          anchor: 'top',
          align: 'left'  , // ✅ 現貨顯示在上方
         
          offset: 12,   // ✅ 第一組用 6px 的偏移，避免和第二組重疊
          formatter: (value, context) => {
            // ✅ 只顯示最後一筆
            return context.dataIndex === context.dataset.data.length - 1 ? value : '';
          }  
        },
        
       

        
        },
        { 
          label: '台指期近一', 
          data: [], 
          borderColor: '#f28e2b', 
          fill: false, 
          spanGaps: true,
          datalabels: {   // ✅ 改成 datalabels
            anchor: 'top',
            align: 'left'  , // ✅ 近一顯示在下方
            offset: 12 , // ✅ 第二組用 2px 的偏移，避免和第一組重疊
            
            formatter: (value, context) => {
              // ✅ 只顯示最後一筆
              return context.dataIndex === context.dataset.data.length - 2 ? value : '';
            }
          },
          pointRadius: 3,   // 點更大
          borderWidth: 3,   // 線更粗
          tension: 0.6  ,    // 曲線更柔和,
          yAxisID: 'y2'

        }
]

    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 30,  // ✅ 右邊留空間，避免最後一筆被擋
          top: 20     // ✅ 上方留空間，避免數字貼邊
        }
      },
      plugins: {
        title: { display: true, text: titleText, color: '#000' },
        zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }, pan: { enabled: true, mode: 'xy' } },
        datalabels: {
          color: '#000',   // ✅ 全域樣式保留
          clip: false
          
        }
      },
      scales: {
        x: { 
           ticks: { 
            autoSkip: true,  maxTicksLimit: Math.max(5, Math.floor(window.innerWidth / 100)),  
            color: '#000' 

           }, 
          
        
          
        title: { display: true, text: '時間', color: '#000' } },

        y1: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: '台指期現貨' }
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: '台指期近一' },
          grid: { drawOnChartArea: false } // 避免重疊
        },
        y: { title: { display: true, text: yLabel, color: '#000' }, ticks: { color: '#000', padding: 10 }, beginAtZero: false }

      }
    },
    plugins: [ChartDataLabels]
  });
}




  const priceChart = createChart(priceCtx, '台指期 - 價格走勢', '價格');
  const changeChart = createChart(changeCtx, '台指期 - 漲跌走勢', '漲跌數值');
  const percentChart = createChart(percentCtx, '台指期 - 漲幅%走勢', '百分比(%)');

  // 切換暗色/明亮模式
  toggleBtn.addEventListener('click', () => {
    const dark = body.classList.contains('light');
    body.classList.toggle('light', !dark);
    body.classList.toggle('dark', dark);
    toggleBtn.textContent = dark ? '切換明亮模式' : '切換暗色模式';

    const color = dark ? '#fff' : '#000';
    [priceChart, changeChart, percentChart].forEach(chart => {
      chart.options.plugins.title.color = color;
      chart.options.scales.x.title.color = color;
      chart.options.scales.x.ticks.color = color;
      chart.options.scales.y.title.color = color;
      chart.options.scales.y.ticks.color = color;
      chart.options.plugins.datalabels.color = color;
      chart.update();
    });
  });

  // 重置縮放
  resetZoomBtn.addEventListener('click', () => {
    [priceChart, changeChart, percentChart].forEach(chart => chart.resetZoom());
  });



 

  // ✅ 更新原始數值表格
function updateRawTable(sourceName, now, data) {
  const tableBody = document.querySelector('#rawDataTable tbody');
  const changeClass = data.change >= 0 ? 'value-positive' : 'value-negative';
  const percentClass = data.changePercent >= 0 ? 'value-positive' : 'value-negative';
  const priceClass = data.price >= 0 ? 'value-positive' : 'value-negative'; // ✅ 新增價格判斷
  const changeArrow = data.change >= 0 ? '▲' : '▼';
  const percentArrow = data.changePercent >= 0 ? '▲' : '▼';
  const priceArrow = data.price >= 0 ? '▲' : '▼'; // ✅ 新增價格箭頭

  // ✅ 找到對應的 row，如果沒有就建立
  let row = tableBody.querySelector(`tr[data-source="${sourceName}"]`);
  if (!row) {
    row = document.createElement('tr');
    row.setAttribute('data-source', sourceName);
    tableBody.appendChild(row);
  }

  // ✅ 每次更新只改內容，不新增 row
  row.innerHTML = `
    <td>${sourceName}</td>
    <td>${now}</td>
    <td class="${priceClass}">${priceArrow} ${data.price}</td>   <!-- ✅ 價格依正負顯示 -->
    <td class="${changeClass}">${changeArrow} ${data.change}</td>
    <td class="${percentClass}">${percentArrow} ${data.changePercent}</td>
  `;
}



const MAX_TABLE_ROWS = 20; // 表格最多顯示 20 筆


function getStepSize(range) {
  if (range <= 10) return 1;     // 小範圍 → 每 1 單位一格
  if (range <= 50) return 2;     // 中範圍 → 每 2 單位一格
  return Math.ceil(range / 15);  // 大範圍 → 自動分 15 格
}



function pushData(chart, label, value1, value2) {


  const lastVal1 = chart.data.datasets[0].data.at(-1);
  const lastVal2 = chart.data.datasets[1].data.at(-1);

  // ✅ 檢查各自是否跟自己上一筆相同
  const skip1 = (value1 === lastVal1);
  const skip2 = (value2 === lastVal2);

  if (skip1 && skip2) {
    console.log("兩組都沒變動，跳過更新", { value1, value2 });
    return;
  }

  chart.data.labels.push(label);

  chart.data.datasets[0].data.push(value1);
  chart.data.datasets[1].data.push(value2);

  if (chart.data.labels.length > MAX_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }

  // 避免 null 影響範圍計算
  const validData = chart.data.datasets.flatMap(ds => ds.data).filter(v => v !== null);
if (validData.length > 0) {
  const recentData = validData.slice(-100); // 只看最近 100 筆
  const minVal = Math.min(...recentData);
  const maxVal = Math.max(...recentData);
  let range = maxVal - minVal;
  if (range < 1) range = 1; // 最小範圍至少 1

  const paddingRatio = getPaddingRatio(range);

  chart.options.scales.y.min = minVal - (range * paddingRatio);
  chart.options.scales.y.max = maxVal + (range * paddingRatio);

  chart.options.scales.y.ticks.stepSize = Math.max(1, Math.ceil(range / 10));

  console.log(`更新範圍: min=${minVal}, max=${maxVal}, range=${range}, padding=${range * paddingRatio}`);
}



  chart.update();
}



// 第一組
window.api.onFutureData((data) => {
  if (!data) return;
  const now = new Date().toLocaleTimeString();
  console.log("第一組資料:", data);

  pushData(priceChart, now, data.price, priceChart.data.datasets[1].data.at(-1) ?? null);
  pushData(changeChart, now, data.change, changeChart.data.datasets[1].data.at(-1) ?? null);
  pushData(percentChart, now, data.changePercent, percentChart.data.datasets[1].data.at(-1) ?? null);


  updateRawTable('台指期現貨', now, data);
});

// 第二組
window.api.onFutureDataNT2((data) => {
  if (!data) return;
  const now = new Date().toLocaleTimeString();
  console.log("第二組資料:", data);

  pushData(priceChart, now, priceChart.data.datasets[0].data.at(-1) ?? null, data.price);
  pushData(changeChart, now, changeChart.data.datasets[0].data.at(-1) ?? null, data.change);
  pushData(percentChart, now, percentChart.data.datasets[0].data.at(-1) ?? null, data.changePercent);

  updateRawTable('台指期近一', now, data);
});




});
