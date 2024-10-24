const path = require('path');
const { app } = require('electron');
const fs = require('fs');

module.exports =  class WriteLogs {
    configFilePath = path.join(app.getPath('userData'), 'config.json'); // archivo donde se guardará el path de preferencia del usuario
    globalConfig = { dataPath: '' }  // Cargar configuración al iniciar la app

    constructor() {
        
    }

        // Función para escribir un log
    writeLog(filename, functionName, logType, logText) {
    
            if (!this.globalConfig.dataPath) {
                console.error('No se ha seleccionado una ruta de almacenamiento.');
                return;
            }
      
            const logFilePath = path.join(this.globalConfig.dataPath, 'appLogs.json');
            const logs = JSON.parse(fs.readFileSync(logFilePath)); // Leemos los logs actuales
      
            const newLog = {
                date: new Date().toISOString(),
                filename: filename,
                function: functionName,
                logType: logType, // "eventos", "errores", "logs del programador", etc.
                log: logText
            };
      
            logs.push(newLog);
      
            fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2)); // Actualizamos el archivo JSON
     }
      
          // Función para guardar la configuración Path en el archivo JSON de forma Local
    saveConfig(config) {
        let msg = ""
        try {
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
            msg = `Configuración guardada:${config}`
            this.writeLog('main.js', 'saveConfig', 'savePath', msg);
            console.log(msg);
        } catch (err) {
            msg = `Error al guardar el archivo de configuración:${err}`
            this.writeLog('main.js', 'saveConfig', 'Error', msg);
            console.error('Error al guardar el archivo de configuración:', err);
        }
    }
      
          // Función para cargar la configuración Path desde el archivo JSON local
    loadConfig() {
        this.configFilePath = path.join(app.getPath('userData'), 'config.json'); // archivo donde se guardará el path de preferencia del usuario
    
             let msg = ""
            try {
                if (fs.existsSync(this.configFilePath)) {
                    const data = fs.readFileSync(this.configFilePath);
                    this.globalConfig = JSON.parse(data);
                    return this.globalConfig
                }
            } catch (err) {
                msg = `Error al leer el archivo de configuración:${err}`
                 this.writeLog('main.js', 'loadConfig', 'Error', msg);
                console.error('Error al leer el archivo de configuración:', err);
                
            }
            this.globalConfig = { dataPath: '' };
            return   this.globalConfig // Si no existe, devolvemos un objeto vacío por defecto
        }
      

}