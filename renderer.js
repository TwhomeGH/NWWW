window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleTheme');
  const resetZoomBtn = document.getElementById('resetZoom');
  const body = document.body;

  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const changeCtx = document.getElementById('changeChart').getContext('2d');
  const percentCtx = document.getElementById('percentChart').getContext('2d');

  const MAX_POINTS = 500; // ✅ 只顯示最新 500 筆資料

  const MAX_RANGE = 5;  // ✅ 最大顯示範圍
  const MIN_RANGE = 5; // 最小顯示範圍


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
    tension: 0.3, 
    spanGaps: true,
    datalabels: {   // ✅ 改成 datalabels
    anchor: 'end',
    align: 'top'   // ✅ 現貨顯示在上方
  }
   
  },
   { 
    label: '台指期近一', 
    data: [], 
    borderColor: '#f28e2b', 
    fill: false, 
    tension: 0.3, 
    spanGaps: true,
    datalabels: {   // ✅ 改成 datalabels
      anchor: 'end',
      align: 'top' // ✅ 近一顯示在下方
    }

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
          offset: 6,
          clip: false,
          formatter: (value, context) => {
            // ✅ 只顯示最後一筆
            return context.dataIndex === context.dataset.data.length - 1 ? value : '';
          }
        }
      },
      scales: {
        x: { 
           ticks: { 
            autoSkip: true,  maxTicksLimit: Math.max(5, Math.floor(window.innerWidth / 80))  // ✅ 根據視窗寬度決定顯示刻度
            , color: '#000' 

           }, 
          
        
          
        title: { display: true, text: '時間', color: '#000' } },
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

  // 共用函式：更新範圍
  function updateChartRange(chart, datasetIndex, paddingRatio = 0.3) {
    const data = chart.data.datasets[datasetIndex].data.filter(v => v !== null);
    if (data.length === 0) return;

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    chart.options.scales.y.min = minVal - range * paddingRatio;
    chart.options.scales.y.max = maxVal + range * paddingRatio;

    chart.update();
  }

 

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

function pushData(chart, label, value1, value2, paddingRatio) {
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
    const minVal = Math.min(...validData);
    const maxVal = Math.max(...validData);
    let range = maxVal - minVal || 1;

    // 如果差異太小，強制放大
    if (range < 5) range = 10;   // ✅ 小差異強制展開 20
    // 如果差異太大，限制最大範圍
    if (range > 200) range = 20;


    chart.options.scales.y.min = minVal - range * paddingRatio;
    chart.options.scales.y.max = maxVal + range * paddingRatio;

  
  }

  chart.update();
}



// 第一組
window.api.onFutureData((data) => {
  if (!data) return;
  const now = new Date().toLocaleTimeString();
  console.log("第一組資料:", data);

  pushData(priceChart, now, data.price, priceChart.data.datasets[1].data.at(-1) ?? null, 0.05);
  pushData(changeChart, now, data.change, changeChart.data.datasets[1].data.at(-1) ?? null, 0.05);
  pushData(percentChart, now, data.changePercent, percentChart.data.datasets[1].data.at(-1) ?? null, 0.05);


  updateRawTable('台指期現貨', now, data);
});

// 第二組
window.api.onFutureDataNT2((data) => {
  if (!data) return;
  const now = new Date().toLocaleTimeString();
  console.log("第二組資料:", data);

  pushData(priceChart, now, priceChart.data.datasets[0].data.at(-1) ?? null, data.price, 0.5);
  pushData(changeChart, now, changeChart.data.datasets[0].data.at(-1) ?? null, data.change, 0.2);
  pushData(percentChart, now, percentChart.data.datasets[0].data.at(-1) ?? null, data.changePercent, 0.2);

  updateRawTable('台指期近一', now, data);
});




});
