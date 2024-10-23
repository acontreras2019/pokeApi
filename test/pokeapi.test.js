describe('PokeAPI', function() {
  let expect;

  // Cargar Chai antes de ejecutar cualquier prueba
  before(async function() {
    const chai = await import('chai');
    expect = chai.expect;
  });

  it('should fetch the correct Pokémon data', async function() {
    const getPokemon = require('../src/services/pokeapi.js');
    const data = await getPokemon('pikachu');
    const poke = await data.json()
    expect(poke.name).to.equal('pikachu');
  });

  it('should throw an error for an invalid Pokémon', async function() {
    const getPokemon = require('../src/services/pokeapi.js');
    try {
       await getPokemon('invalidPokemon');
    } catch (error) {
      expect(error.message).to.equal('Error fetching Pokémon data');
    }
  });
});
