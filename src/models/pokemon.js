const { Sequelize, DataTypes, Model } = require('sequelize');
const Configdb = require('../config/dbConfig.js');


const configdb = new Configdb();             
const sequelize = new Sequelize(configdb.database, configdb.user,  configdb.password, { host: configdb.host, dialect: configdb.dialect });

// const DataTypes = requiere('@sequelize/core');
class Pokemon extends Model {}
    Pokemon.init(
      {
       
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: true,
          } ,
        pokemonName:  {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
          } ,
        base_experience:  DataTypes.INTEGER,
        is_default:  DataTypes.TINYINT, 
        order:  DataTypes.INTEGER,
        weight: DataTypes.INTEGER,
       
      },
      { sequelize,
        modelName: 'pokemones', 
        timestamps: true,
      }
    );

    Pokemon.sync()
    module.exports = Pokemon;

  