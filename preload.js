const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('loanAPI', {
  post: (path, data = {}) => ipcRenderer.invoke('loan-api-post', path, data)
});
