// electron/preload.js
// Secure bridge — exposes only safe APIs to renderer

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__ELECTRON__', {
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  getVersion:   () => ipcRenderer.invoke('get-version'),
  openFile:     (filters) => ipcRenderer.invoke('open-file-dialog', filters),
  saveFile:     (opts) => ipcRenderer.invoke('save-file-dialog', opts),
  writeFile:    (opts) => ipcRenderer.invoke('write-file', opts),
});
