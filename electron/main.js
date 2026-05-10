// electron/main.js
// InkFlow Studio — Electron Desktop App
// Builds to .exe (Windows), .dmg (Mac), .AppImage (Linux)

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');

// ── Machine ID for license binding ──────────────────────────────
function getMachineId() {
  const components = [
    os.cpus()[0]?.model ?? 'cpu',
    os.totalmem(),
    os.hostname(),
    os.platform(),
    os.arch(),
  ].join('|');
  return crypto.createHash('sha256').update(components).digest('hex').slice(0, 32);
}

// ── App startup sentinel ──────────────────────────────────────
const APP_VERSION = '1.0.0';
const STARTUP_TIME = Date.now();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'InkFlow Studio',
    backgroundColor: '#1a1a1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    // Custom titlebar
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    // App icon
    icon: path.join(__dirname, '../build-resources/icon.png'),
  });

  // Load the Next.js app (production build served locally)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, Next.js is exported as static files
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
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

// ── IPC handlers ─────────────────────────────────────────────

// Expose machine ID to renderer (for license binding)
ipcMain.handle('get-machine-id', () => getMachineId());

// App version
ipcMain.handle('get-version', () => APP_VERSION);

// Open file dialog (for image insert)
ipcMain.handle('open-file-dialog', async (_, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters ?? [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
    ],
  });
  if (result.canceled) return null;
  const filePath = result.filePaths[0];
  const data = fs.readFileSync(filePath);
  return {
    path: filePath,
    base64: data.toString('base64'),
    mimeType: getMimeType(filePath),
  };
});

// Save file dialog (for export)
ipcMain.handle('save-file-dialog', async (_, { defaultName, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName ?? 'inkflow-export',
    filters: filters ?? [{ name: 'PDF', extensions: ['pdf'] }],
  });
  return result.canceled ? null : result.filePath;
});

// Write file (for export)
ipcMain.handle('write-file', async (_, { filePath, data, encoding }) => {
  fs.writeFileSync(filePath, Buffer.from(data, encoding ?? 'base64'));
  return true;
});

// Tamper-detection sentinel — inject into renderer
app.on('web-contents-created', (_, contents) => {
  contents.on('did-finish-load', () => {
    contents.executeJavaScript(`window.__ELECTRON__ = true; window.__INKFLOW_SENTINEL__ = 'authentic';`);
  });
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  return map[ext] ?? 'application/octet-stream';
}
