const { Sequelize, DataTypes, Model } = require('sequelize');
const Configdb = require('../config/dbConfig.js');
const configdb = new Configdb();             
const sequelize = new Sequelize(configdb.database, configdb.user,  configdb.password, { host: configdb.host, dialect: configdb.dialect });

// const DataTypes = requiere('@sequelize/core');
class Specie extends Model {}
Specie.init(
      {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
          } ,
          specieId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          } ,
          baseHapiness:  { type: DataTypes.INTEGER } ,
          capture_rate:  {type: DataTypes.INTEGER},
          colorId:  {type: DataTypes.INTEGER},
          eggGroupId:  {type: DataTypes.INTEGER},
          evolutionChainId:  {type: DataTypes.INTEGER},
          evolutionFromSpeciesId:  {type: DataTypes.INTEGER},
          shapeId:  {type: DataTypes.INTEGER},
          growthRateId:  {type: DataTypes.INTEGER},
          specieName:  {
            type: DataTypes.STRING,
            allowNull: false,
          } ,
          gender_rate: DataTypes.INTEGER,
          forms_switchable: DataTypes.TINYINT,
          isbaby: DataTypes.TINYINT,
          islegendary: DataTypes.TINYINT,
          ismythical: DataTypes.TINYINT,
      },
      { sequelize,
        modelName: 'species', 
        timestamps: true,
      }
    );

    Specie.sync()
    module.exports = Specie;