document.getElementById('choose-folder-btn').addEventListener('click', () => {
    window.electronAPI.requestLogPath();// Funcion que se dispara al hacer click en el boton para seleccionar el path
  });
  