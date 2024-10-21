const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  requestLogPath: () => ipcRenderer.send('select-directory'), // Mostrar popup para seleccion de ruta del path
});
