
const fs = require('fs');
const Api = require('../config/apiConfig.json');
const Pokemon = require('../models/pokemon.js');
const Ability = require('../models/ability.js');
const Pokemonabilities = require('../models/pokemonabilities.js');
const WriteLogs = require('./writeLogs.js');

module.exports =  class ServicePokemon {
  writeLogs
  globalConfig 
  constructor() {
    this.writeLogs = new WriteLogs()
    this.globalConfig = this.writeLogs.loadConfig(); 

  }

  
  // Consultar la PokeApi
  async getPokemon(name) {
    
    const url = Api.getPokebyName.url + name
    const response = await fetch(url);

    if (!response.ok) {
      return 'Error fetching Pokémon data';
      
    }
    return  await response.json();;
  }

  async findOrCreatePokemon(pk, abilities){
    let msg
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
        this.writeLogs.writeLog('ServicePokemon.js', 'request-pokemon-list', 'responsebd', msg);
        console.log(msg)
        await this.AddPokemonAsociaciones (pk.id,abilities) // funcion para agregar informacion a  tablas ability
      
        return created
    }
        //event.sender.send('pokemon-list', JSON.stringify(json));} // envio de datos del pokemon al render
    else{
      // enviar al render la info de la base de datos
      msg = `Pokemon ya existe en bd: ${reg.pokemonName}`
      // console.log(msg)
      this.writeLogs.writeLog('ServicePokemon.js', 'request-pokemon-list', 'responsebd', msg);
      return reg

    }
  }
    // Función para guardar los datos en las tablas de habilidades y sus asociaciones con el pokemon
    async  AddPokemonAsociaciones(pokemonId, data){
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
          this.writeLogs.writeLog('ServicePokemon.js', 'AddPokemonAsociaciones', 'responsebd', msg);
          console.log(msg); 
        }
        else{
        
          // enviar al render la info de la base de datos
          msg = `Habilidad ya existe en bd ${ab.id}`
          this.writeLogs.writeLog('ServicePokemon.js', 'AddPokemonAsociaciones', 'responsebd', msg);
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
          this.writeLogs.writeLog('ServicePokemon.js', 'AddPokemonAsociaciones', 'responsebd', msg);
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
              this.writeLogs.writeLog('ServicePokemon.js', 'AddPokemonAsociaciones', 'responsebd', msg);
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
        this.writeLogs.writeLog('ServicePokemon.js', 'AddPokemonAsociaciones', 'responsebd', err);
        event.sender.send('ab-listError', err);
      }

    })
  }

}
