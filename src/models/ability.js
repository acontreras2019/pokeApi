const { Sequelize, DataTypes, Model } = require('sequelize');
const Configdb = require('../config/dbConfig.js');
const configdb = new Configdb();             
const sequelize = new Sequelize(configdb.database, configdb.user,  configdb.password, { host: configdb.host, dialect: configdb.dialect });

// const DataTypes = requiere('@sequelize/core');
class Ability extends Model {}
Ability.init(
      {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,

          } ,
        generationId:  {
            type: DataTypes.INTEGER,
        
          } ,
          abilityName: DataTypes.STRING,
       
      },
      { sequelize,
        modelName: 'abilities', 
        timestamps: true,
      }
    );

    Ability.sync()
    module.exports = Ability;

  