const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onPokemonList: (callback) => ipcRenderer.on('pokemon-list', (event, pokemonList) => callback(pokemonList)),
  requestPokemonList: (pokeName) => ipcRenderer.send('request-pokemon-list', pokeName), // Enviar solicitud de lista
  errorMessage: (callback) => ipcRenderer.on('pokemon-listError', (event, error) => callback(error)),
  errorAbilityMessage: (callback) => ipcRenderer.on('ab-listError', (event, error) => callback(error)),
  requestLogPath: () => ipcRenderer.send('select-directory'), // Mostrar popup para seleccion de ruta del path

});
