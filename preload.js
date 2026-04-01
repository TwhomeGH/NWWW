const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // 第一組資料
  onFutureData: (callback) => {
    ipcRenderer.on('future-data', (event, data) => callback(data));
  },

  // 第二組資料
  onFutureDataNT2: (callback) => {
    ipcRenderer.on('future-data-nt2', (event, data) => callback(data));
  }
});
