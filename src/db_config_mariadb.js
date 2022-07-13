const knex = require('knex')

const configMariaDB = {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      port: 3306,
      database: 'productos'
    },
    pool: { min: 0, max: 7 }
}

const dbMariadb = knex(configMariaDB)
module.exports = dbMariadb