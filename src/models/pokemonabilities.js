const { Sequelize, DataTypes, Model } = require('sequelize');
const Configdb = require('../config/dbConfig.js');
const Pokemon = require('./pokemon.js');
const Ability = require('./ability.js');
const configdb = new Configdb();             
const sequelize = new Sequelize(configdb.database, configdb.user,  configdb.password, { host: configdb.host, dialect: configdb.dialect });

// const DataTypes = requiere('@sequelize/core');
class Pokemonabilities extends Model {}
Pokemonabilities.init(
      {
        pokemonId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: Pokemon, // 'Movies' would also work
              key: 'pokemonId',
            },
        } ,
        abilityId:  {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: Ability, // 'Movies' would also work
              key: 'abilityId',
            },
        }
      },
      { sequelize,
        modelName: 'pokemonabilities', 
        timestamps: true,
      }
    );

    //Asociaciones
    Pokemon.belongsToMany(Ability, {as: 'abilities', through: 'pokemonabilities', foreignKey: 'pokemonId'});
    Ability.belongsToMany(Pokemon, { as: 'Pokemones', through: 'pokemonabilities', foreignKey: 'abilityId' });

    Pokemonabilities.sync()
    module.exports = Pokemonabilities;

  