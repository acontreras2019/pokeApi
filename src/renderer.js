
const infoAPI = document.getElementById('info-API');
const contenedorPoke = document.getElementById('tabla-pokemon');
const contenedorAbi = document.getElementById('tabla-ability');

document.getElementById('load-pokemon-btn').addEventListener('click', () => {
  const pokeName = document.getElementById('pokemonName').value;
  console.log(`Nombre a buscar ${pokeName} `)
  window.electronAPI.requestPokemonList(pokeName);// Funcion que se dispara al hacer click en el boton
});


// Recibir la lista de Pokémon desde el proceso principal
window.electronAPI.onPokemonList((data) => {
  
  limpiarTabla()

  const tableBody = document.createElement('table');
  const tableAbilities =  document.createElement('table');

  console.log(" render lista pokemon")
  const pokemon = JSON.parse(data);

    //Encabezado de Tabla Pokemon
    const rowh = document.createElement('tr');
    const hname = document.createElement('th') 
    const hid = document.createElement('th') 
    hname.textContent = "Name"
    hid.textContent = "Id"
    rowh.appendChild(hname);
    rowh.appendChild(hid);
    tableBody.appendChild(rowh);


  // Agregar filas a la tabla con los Pokémon
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const idCell = document.createElement('td');
    nameCell.textContent = pokemon.pokemonName ?? pokemon.pk.pokemonName;
    idCell.textContent = pokemon.id ?? pokemon.pk.id;
    row.appendChild(nameCell);
    row.appendChild(idCell);
    tableBody.appendChild(row);

    contenedorPoke.appendChild(tableBody);

    // tabla de habilidades del pokemon

    //Encabezado de Tabla Ability
    const rowAbih = document.createElement('tr');
    const hAbility = document.createElement('th') 
    const hAbilityId = document.createElement('th') 
    hAbility.textContent = "Ability"
    hAbilityId.textContent = "AbilityId"
    rowAbih.appendChild(hAbility);
    rowAbih.appendChild(hAbilityId);
    tableAbilities.appendChild(rowAbih);

    pokemon.abilities.forEach(ab => {
        const rowAb = document.createElement('tr');
        const nameCellAb = document.createElement('td');
        const idCellAb = document.createElement('td');
        nameCellAb.textContent = ab.abilityName
        idCellAb.textContent = ab.id
        rowAb.appendChild(nameCellAb);
        rowAb.appendChild(idCellAb);
        tableAbilities.appendChild(rowAb);
    })

    contenedorAbi.appendChild(tableAbilities);

});


// Recibir error del proceso principal
window.electronAPI.errorMessage((error) => {
  limpiarTabla()
   infoAPI.innerText = error
  console.log(error)
})


// Recibir error del proceso Ability
window.electronAPI.errorAbilityMessage((error) => {
  limpiarTabla()
  infoAPI.innerText = error
 console.log(error)
})

function limpiarTabla(){

    // Limpiar cualquier tabla existente
    contenedorPoke.innerHTML = '';
    contenedorAbi.innerHTML = '';

}
