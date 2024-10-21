
const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const path = require('path');
const fs = require('fs');
const Api = require('./src/config/apiConfig.json');
const Pokemon = require('./src/models/pokemon.js');
const Ability = require('./src/models/ability.js');
const Specie = require('./src/models/specie.js');
const Pokemonabilities = require('./src/models/pokemonabilities.js');

// Configuración global para almacenar la ruta de almacenamiento

console.log(app.getPath('userData'))
const configFilePath = path.join(app.getPath('userData'), 'config.json'); // archivo donde se guardará el path de preferencia del usuario

let mainWindow;
let popupWindow;
let globalConfig = loadConfig();  // Cargar configuración al iniciar la app



    function createWindow() {
       mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        
        webPreferences: {
          preload: path.join(__dirname, 'src/preload.js'),
          nodeIntegration: false, // Deja esto en falso por seguridad
          contextIsolation: true, // Asegura que el preload tenga aislamiento
        },
      });

      mainWindow.loadFile('src/index.html');

      // Solo abrir DevTools en desarrollo
      mainWindow.webContents.openDevTools();
    }
  
    // Función para crear la ventana emergente
    function createPopupWindow() {
      popupWindow = new BrowserWindow({
          width: 400,
          height: 200,
          parent: mainWindow,
          modal: true,
          show: false, // Se mostrará después de cargarse
          webPreferences: {
            nodeIntegration: false, // Deja esto en falso por seguridad
            contextIsolation: true, // Asegura que el preload tenga aislamiento
              preload: path.join(__dirname, 'src/preload.js'),
          }
      });

      popupWindow.loadFile('src/views/popup.html'); // Carga el archivo HTML del popup
      popupWindow.once('ready-to-show', () => {
          popupWindow.show(); // Mostrar el popup cuando esté listo
      });

      popupWindow.webContents.openDevTools();
    }

  // Funciones para procesar el JSON y extraer la lista de Pokemons
    function extractPokemonList(data) {
      // funcion transformacion de Json pokemon to Pokemon model
      // Mapeamos la lista de resultados para extraer el nombre y el ID
        const id = data.id;
        const name = data.name;
        const base_experience = data.base_experience;
        const is_default = data.is_default;
        const order = data.order;
        const weight = data.weight;
      

        // Retornamos un nuevo objeto Pokemon con name e id
        const pokemon= new Pokemon() ;
        pokemon.id = parseInt(id, 10)
        pokemon.pokemonName = name
        pokemon.base_experience = base_experience
        pokemon.is_default = is_default
        pokemon.order = order
        pokemon.weight = weight

      return pokemon;
    }

    function extractAbilityListt(data) {
      // funcion transformacion de Json Abilities to Ability model
        const AbilityList = []
        data.forEach(ab => {
        
            const urlParts = ab.ability.url.split('/');
            const id = urlParts[urlParts.length - 2];
            const ability  = new Ability()
            ability.id = id
            ability.abilityName = ab.ability.name
            AbilityList.push(ability)

        })
        return AbilityList;
    }


    function getIdByUrl(url){
      const idUrlParts = url.split('/');
      const Id = idUrlParts[idUrlParts.length - 2];
      return Id
    }

    function extractSpecies(data) {
        // funcion transformacion de Json Species to Specie model
          
              console.log(data)
              const spId = getIdByUrl(data.url)
              const specieName = data.name

              console.log(`specieId: ${spId} - specieName: ${specieName}`)
              const specie  = new Specie()
              specie.specieId = spId
              specie.base_happiness =  data.name
              specie.capture_rate =  data.name      
          return specie;
    }

    // Función para escribir un log
    function writeLog(filename, functionName, logType, logText) {
      if (!globalConfig.dataPath) {
          console.error('No se ha seleccionado una ruta de almacenamiento.');
          return;
      }

      const logFilePath = path.join(globalConfig.dataPath, 'appLogs.json');
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
      console.log('Log registrado:', newLog);
    }

    // Función para guardar la configuración en el archivo JSON
  function saveConfig(config) {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
        msg = `Configuración guardada:${config}`
        writeLog('main.js', 'saveConfig', 'savePath', msg);
        console.log(msg);
    } catch (err) {
        msg = `Error al guardar el archivo de configuración:${err}`
        writeLog('main.js', 'saveConfig', 'Error', msg);
        console.error('Error al guardar el archivo de configuración:', err);
    }
  }


  // Función para cargar la configuración desde el archivo JSON
  function loadConfig() {
      try {
          if (fs.existsSync(configFilePath)) {
              const data = fs.readFileSync(configFilePath);
              return JSON.parse(data);
          }
      } catch (err) {
          msg = `Error al leer el archivo de configuración:${err}`
          writeLog('main.js', 'loadConfig', 'Error', msg);
          console.error('Error al leer el archivo de configuración:', err);
          
      }
      return { dataPath: '' };  // Si no existe, devolvemos un objeto vacío por defecto
  }



    async function AddPokemonAsociaciones(pokemonId, data){
      let msg

      let count = 0
      data.forEach(async ab => {
        try{
          // Obtener o Crear las Abilidades en la base de datos
          const [reg, created] = await Ability.findOrCreate({
            where: {
              id:  ab.id
            },
            defaults: {
              id: ab.id,
              abilityName: ab.abilityName,
            },
          });
          if (created) {
            msg = `Habilidad creada ${reg.abilityName}`
            writeLog('main.js', 'AddPokemonAsociaciones', 'responsebd', msg);
            console.log(msg); 
          }
          else{
          
            // enviar al render la info de la base de datos
            msg = `Habilidad ya existe en bd ${ab.id}`
            writeLog('main.js', 'AddPokemonAsociaciones', 'responsebd', msg);
            console.log(msg); 

          }
          // // Obtener o Crear en la tabla Asociativa Pokemon -Ability en la base de datos 
          const [pkAbility, regCreated] = await Pokemonabilities.findOrCreate({
            where: {
              pokemonId:   pokemonId,
              abilityId:  ab.id
            },
            defaults: {
              pokemonId: pokemonId,
              abilityId: ab.id,
            },
            
          });
          if (regCreated) {

            msg=`Creacion de asociacion correcta ${pkAbility.pokemonId} -${pkAbility.abilityId} `
            writeLog('main.js', 'AddPokemonAsociaciones', 'responsebd', msg);
            console.log(msg); 
            count= count+ 1
            if(data.length == count){
              //Obteniendo el nuevo pokemon con las asociaciones
              const pkNuevo = await Pokemon.findOne({
                where: {
                  id:  pokemonId
                }
              });
              if(pkNuevo== null){
                msg= "Error pkNuevo"
                writeLog('main.js', 'AddPokemonAsociaciones', 'responsebd', msg);
                console.log(msg); 
            }
            else{
            
              // enviar al render la info de la base de datos
              console.log(`Habilidad ya existe en bd ${ab.id}`)
            }
          }
        }

        }catch(err){
          //Enviar el error
          console.log(err)
          writeLog('main.js', 'AddPokemonAsociaciones', 'responsebd', err);
          event.sender.send('ab-listError', err);
        }

      })
    }

    async function AddPokemonSpecie(pokemonId, data) { // en programacion
      const [reg, created] = await Specie.findOrCreate({
        where: {
          specieId:  data.specieId
        },
        defaults: {
          specieId: data.specieId,
          specieName: data.specieName,
        },
      });
      if (created) {
        console.log(reg.specieName); 
        // pendiente programar
      }
      else{
      
        // enviar al render la info de la base de datos
        console.log(`Specie ya existe en bd ${specie.specieId}`)

      }
    }

  // Request from preload
    ipcMain.on('request-pokemon-list', async (event, pokeName) => {
      const url = Api.getPokebyName.url + pokeName
      const pokeApiResponse = await fetch(url);
      let msg

      // peticion a PokeApi para obtener datos de Pokemon
      if(pokeApiResponse.status ==200 ){
        try{
          const data = await pokeApiResponse.json();
          let pk = extractPokemonList(data);
          let abilities = extractAbilityListt(data.abilities); // obtener las habilidades
          let specie = extractSpecies(data.species); // obtener la specie
          //console.log(specie)
          
          
          // revisar si existe en la base de Datos
              try{
                const [reg, created] = await Pokemon.findOrCreate({
                  where: {
                    pokemonName:  pk.pokemonName
                  },
                  defaults: {
                    id: pk.id,
                    pokemonName: pk.pokemonName,
                    is_default: pk.is_default,
                    order:  pk.order,
                    weight: pk.weight
                  }
                  ,
                  include: { model: Ability , as: "abilities"  }
                });
                if (created) {
                  // Pokemon creado en la bb
                    msg = `Pokemon CREADO en bd: ${pk.pokemonName} `
                    writeLog('main.js', 'request-pokemon-list', 'responsebd', msg);
                    console.log(msg)
                    await AddPokemonAsociaciones (pk.id,abilities) // funcion para agregar informacion a  tablas ability
                    //await AddPokemonSpecie (pk.id,specie) // funcion para agregar informacion a tablas specie , pendiente programacion

                    const json  = {pk, abilities}
                    event.sender.send('pokemon-list', JSON.stringify(json));} // envio de datos del pokemon al render
                else{
                  // enviar al render la info de la base de datos
                  msg = `Pokemon ya existe en bd: ${reg.pokemonName}`
                  console.log(msg)
                  writeLog('main.js', 'request-pokemon-list', 'responsebd', msg);
                  event.sender.send('pokemon-list', JSON.stringify((reg)));// envio de datos del pokemon al render
                }

              }
              catch(err){
                //Enviar el error
                console.log(err)
                writeLog('main.js', 'request-pokemon-list', 'responsebd', error);
                event.sender.send('pokemon-listError', err);
              }
        
          return data;
        }
        catch(error){
          //Enviar el error
          console.log(error)
          writeLog('main.js', 'request-pokemon-list', 'pokemon-listError', error);
          event.sender.send('pokemon-listError', error);
        }
      }
      else{  
          const error = "Pokemon no existe en la API"
          writeLog('main.js', 'request-pokemon-list', 'responseApi', error);
          event.sender.send('pokemon-listError', error);
      }
      
  });

  // Responder cuando se pulsa el botón de selección de carpeta
  ipcMain.on('select-directory', (event) => {
    dialog.showOpenDialog(popupWindow, {
        properties: ['openDirectory'],
        title: 'Selecciona la carpeta para almacenar datos'
    }).then(result => {

      if (!result.canceled) {
        globalConfig.dataPath = result.filePaths[0];
        const logFilePath = path.join(globalConfig.dataPath, 'appLogs.json');

        // Crear el archivo de logs si no existe
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, JSON.stringify([])); // Crear archivo vacío
        }

        // Guardar la ruta en el archivo de configuración
        saveConfig(globalConfig);

        popupWindow.close(); // Cerrar la ventana emergente después de seleccionar
        return { success: true, dataPath: globalConfig.dataPath };
    } else {
        return { success: false, message: 'No se seleccionó ninguna carpeta' };
    }

    }).catch(err => {
        console.error('Error al seleccionar la carpeta:', err);
    });
  });

app.whenReady().then(() => {
    createWindow();

    // Crear una ventana emergente (popup) para solicitar la ruta en caso de estar vacia la ruta, es decir la primera vez
    if(!globalConfig.dataPath){
      createPopupWindow();
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });


});

app.on('window-all-closed', function () {
  writeLog('main.js', 'app.on(window-all-closed)', 'eventos', 'La aplicación ha cerrado todas las ventanas.');
  if (process.platform !== 'darwin') app.quit();
});

