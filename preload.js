const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('loanAPI', {
  call: (action, payload = {}) => ipcRenderer.invoke('loan-api', action, payload)
});
