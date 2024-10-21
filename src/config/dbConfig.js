module.exports = class Configdb {
    width;
    host;
    user;
    password;
    database;
    dialect;

    constructor() {
        //this.width = width;
        this.host     = 'localhost',
        this.user     = 'test',
        this.password ='test12345678',
        this.database = 'pokemonapi',
        this.dialect =  'mysql'
    }
  
  }; 
