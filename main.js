
const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const path = require('path');
const fs = require('fs');
const Api = require('./src/config/apiConfig.json');
const ServicePokemon = require('./src/services/servicePokeapi.js');
const WriteLogs = require('./src/services/writeLogs.js');
const Pokemon = require('./src/models/pokemon.js');
const Ability = require('./src/models/ability.js');
const Specie = require('./src/models/specie.js');
const Pokemonabilities = require('./src/models/pokemonabilities.js');

// Configuración global para almacenar la ruta de almacenamiento

// console.log(app.getPath('userData'))

const servicePokemon = new ServicePokemon()
const writeLogs = new WriteLogs()
// const configFilePath = path.join(app.getPath('userData'), 'config.json'); // archivo donde se guardará el path de preferencia del usuario

let mainWindow;
let popupWindow;
let globalConfig = writeLogs.loadConfig();  // Cargar configuración al iniciar la app


// Función para crear la ventana principal
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
     // mainWindow.webContents.openDevTools();
    }
  
    // Función para crear la ventana emergente de seleccion de Path por el usuario
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

      //popupWindow.webContents.openDevTools();
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

      // Funciones para procesar el JSON y extraer la lista de Abilidades
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

      // Funciones para procesar el JSON y extraer la lista de Species
    function extractSpecies(data) {
        // funcion transformacion de Json Species to Specie model
          
              // console.log(data)
              const spId = getIdByUrl(data.url)
              const specieName = data.name

              console.log(`specieId: ${spId} - specieName: ${specieName}`)
              const specie  = new Specie()
              specie.specieId = spId
              specie.base_happiness =  data.name
              specie.capture_rate =  data.name      
          return specie;
    }

   // Funciones para obtener el Id de las url en ApiPokemon
    function getIdByUrl(url){
      const idUrlParts = url.split('/');
      const Id = idUrlParts[idUrlParts.length - 2];
      return Id
    }

    // Función para guardar los datos en las tablas de species y sus asociaciones con el pokemon
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

  // Request viene desde preload
    ipcMain.on('request-pokemon-list', async (event, pokeName) => {
      // const url = Api.getPokebyName.url + pokeName
      const pokeApiResponse = await servicePokemon.getPokemon(pokeName)
  
      let msg

      // peticion a PokeApi para obtener datos de Pokemon
      if(pokeApiResponse.name){
        try{
          const data = pokeApiResponse
          let pk = extractPokemonList(data);
          let abilities = extractAbilityListt(data.abilities); // obtener las habilidades
          let specie = extractSpecies(data.species); // obtener la specie
          
          // revisar si existe en la base de Datos
              try{

                const res = await servicePokemon.findOrCreatePokemon(pk, abilities)
                if(res){
                  const json  = {pk, abilities}
                   event.sender.send('pokemon-list', JSON.stringify(json)); // envio de datos del pokemon al render
                  
                }
                else{

                  event.sender.send('pokemon-list', JSON.stringify((res)));// envio de datos del pokemon al render
                  
                }
              }   
              catch(err){
                //Enviar el error
                console.log(err)
                writeLogs.writeLog('main.js', 'request-pokemon-list', 'responsebd', error);
                event.sender.send('pokemon-listError', err);
              }
        }
        catch(error){
          //Enviar el error
          console.log(error)
          writeLogs.writeLog('main.js', 'request-pokemon-list', 'pokemon-listError', error);
          event.sender.send('pokemon-listError', error);
        }
      }
      else{  
          const error = `Pokemon no existe en la API: ${pokeName}`
          writeLogs.writeLog('main.js', 'request-pokemon-list', 'responseApi', error);
          event.sender.send('pokemon-listError', error);
      }
      
  });

  // Responder cuando se pulsa el botón de selección de carpeta en el popup de preferencias de usuario
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
        writeLogs.saveConfig(globalConfig);

        popupWindow.close(); // Cerrar la ventana emergente después de seleccionar
        return { success: true, dataPath: globalConfig.dataPath };
    } else {
        return { success: false, message: 'No se seleccionó ninguna carpeta' };
    }

    }).catch(err => {
        console.error('Error al seleccionar la carpeta:', err);
    });
  });

  // Funcion para crear la ventana principal y el popup
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

 // Funcion que se ejecuta cuando se cierran las ventanas 
app.on('window-all-closed', function () {
  writeLogs.writeLog('main.js', 'app.on(window-all-closed)', 'eventos', 'La aplicación ha cerrado todas las ventanas.');
  if (process.platform !== 'darwin') app.quit();
});

