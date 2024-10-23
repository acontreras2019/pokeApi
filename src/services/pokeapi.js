
const fs = require('fs');
const Api = require('../config/apiConfig.json');
const Pokemon = require('../models/pokemon.js');



module.exports = async function getPokemon(name) {
    
  const url = Api.getPokebyName.url + name
  const response = await fetch(url);
  // if (!response.ok) {
  //   throw new Error('Error fetching Pokémon data');
  // }
  return await response;
}




