window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleTheme');
  const resetZoomBtn = document.getElementById('resetZoom');
  const body = document.body;

  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const changeCtx = document.getElementById('changeChart').getContext('2d');
  const percentCtx = document.getElementById('percentChart').getContext('2d');

  const MAX_POINTS = 200; // ✅ 只顯示最新 200 筆資料



function createChart(ctx, titleText, yLabel, showBand = false) {
  const datasets = [
    {
      label: '台指期現貨',
      data: [],
      borderColor: '#4e79a7',
      backgroundColor: 'rgba(78,121,167,0.2)',
      fill: false,
      tension: 0.4,
      yAxisID: 'y'
    },
    {
      label: '台指期近一',
      data: [],
      borderColor: '#f28e2b',
      backgroundColor: 'rgba(242,142,43,0.2)',
      fill: showBand ? '-1' : false, // ✅ 價格圖才顯示區間帶
      tension: 0.4,
      yAxisID: 'y'
    }
  ];

  const diffBandPlugin = {
  id: 'diffBand',
  beforeDatasetsDraw(chart) {
    const ctx = chart.ctx;
    const ds0 = chart.getDatasetMeta(0);
    const ds1 = chart.getDatasetMeta(1);

    ctx.save();
    ctx.fillStyle = 'rgba(255,0,0,0.1)'; // 區間顏色

    ds0.data.forEach((point, i) => {
      const y0 = point.y;
      const y1 = ds1.data[i]?.y;
      if (y1 !== undefined) {
        ctx.fillRect(point.x, Math.min(y0, y1), 2, Math.abs(y0 - y1));
      }
    });

    ctx.restore();
  }
};


  return new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: titleText, color: '#000' },
        datalabels: {
          color: '#000',
          clip: false,
          formatter: (value, context) => {
            // 只顯示最後一筆數字
            return context.dataIndex === context.dataset.data.length - 1
              ? (value !== null ? value.toFixed(2) : '')
              : '';
          }
        }
      },
      scales: {
        x: { ticks: { autoSkip: true, maxTicksLimit: 10, color: '#000' } },
        y: { type: 'linear', position: 'left', title: { display: true, text: yLabel, color: '#000' } }
      }
    },
    plugins: [ChartDataLabels, diffBandPlugin]
  });
}






  const priceChart = createChart(priceCtx, '台指期 - 價格走勢', '價格',true);
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


function updateYAxisRange(chart, datasetIndexes) {
  const allData = datasetIndexes
    .flatMap(i => chart.data.datasets[i].data)
    .filter(v => v !== null);

  if (allData.length > 0) {
    const minVal = Math.min(...allData);
    const maxVal = Math.max(...allData);
    chart.options.scales.y.min = minVal;
    chart.options.scales.y.max = maxVal;
  }
}

function getMaxPoints(chart) {
  const chartWidth = chart.width;
  const pointWidth = 20;
  const maxByWidth = Math.floor(chartWidth / pointWidth);

  return Math.min(MAX_POINTS, Math.max(20, maxByWidth));
}



function getMaxTicks(chart) {
  const chartHeight = chart.height;
  const tickHeight = 10; // 每個刻度大約佔 10px
  return Math.floor(chartHeight / tickHeight);
}

function applyAdaptiveTicks(chart) {
  const maxTicks = getMaxTicks(chart);
  chart.options.scales.y.ticks.maxTicksLimit = maxTicks;
}




function pushData(chart, label, spotVal, nearVal) {
  if (spotVal !== null) chart.data.datasets[0].data.push(spotVal);
  if (nearVal !== null) chart.data.datasets[1].data.push(nearVal);

  chart.data.labels.push(label);

  // ✅ 價格圖才有差值 dataset
  if (chart.data.datasets.length > 2) {
    const latestSpot = chart.data.datasets[0].data.at(-1);
    const latestNear = chart.data.datasets[1].data.at(-1);

    if (latestSpot !== null && latestNear !== null) {
      const diffPercent = ((latestSpot - latestNear) / latestNear) * 100;
      chart.data.datasets[2].data.push(diffPercent);
    } else {
      chart.data.datasets[2].data.push(null);
    }
  }

  // ✅ 自適應 MAX_POINTS
  const maxPoints = getMaxPoints(chart);
  
  chart.data.labels = chart.data.labels.slice(-maxPoints);
  chart.data.datasets.forEach(ds => {
    ds.data = ds.data.slice(-maxPoints);
  });



  // ✅ 自動更新正確的 Y 軸範圍
  if (chart === priceChart) {
    updateYAxisRange(chart, [0, 1]); // 價格圖 → 現貨 + 近一
  } else if (chart === changeChart) {
    updateYAxisRange(chart, [0, 1]); // 漲跌圖 → 現貨 + 近一
  } else if (chart === percentChart) {
    updateYAxisRange(chart, [0, 1]); // 百分比圖 → 現貨 + 近一
  }

  chart.update();
}



  // 第一組：現貨
  window.api.onFutureData((data) => {
    const now = new Date().toLocaleTimeString();

    pushData(priceChart, now, parseFloat(data.price), null);
    applyAdaptiveTicks(priceChart);
    pushData(changeChart, now, parseFloat(data.change), null);
    applyAdaptiveTicks(changeChart);
    pushData(percentChart, now, parseFloat(data.changePercent), null);
    applyAdaptiveTicks(percentChart);

    // ✅ 統一一次更新
    [priceChart, changeChart, percentChart].forEach(c => c.update());

    updateRawTable('台指期現貨', now, data);
  });

  // 第二組：近一
  window.api.onFutureDataNT2((data) => {
    const now = new Date().toLocaleTimeString();

    pushData(priceChart, now, null, parseFloat(data.price));
    applyAdaptiveTicks(priceChart);
    pushData(changeChart, now, null, parseFloat(data.change));
    applyAdaptiveTicks(changeChart);
    pushData(percentChart, now, null, parseFloat(data.changePercent));
    applyAdaptiveTicks(percentChart);

    // ✅ 統一一次更新
    [priceChart, changeChart, percentChart].forEach(c => c.update());

    updateRawTable('台指期近一', now, data);
  });






});
