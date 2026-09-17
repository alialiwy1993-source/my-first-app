const { app, BrowserWindow, Menu, shell } = require('electron');

const APP_URL = 'https://app-cw59bw.v2.appdeploy.ai/';

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 900,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f6f8fc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  Menu.setApplicationMenu(null);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL)) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_URL) && !url.startsWith('file://')) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  win.webContents.on('did-fail-load', (_event, errorCode, _errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame && errorCode !== -3 && !validatedURL.startsWith('file://')) {
      void win.loadFile('offline.html');
    }
  });

  win.once('ready-to-show', () => win.show());
  void win.loadURL(APP_URL);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
