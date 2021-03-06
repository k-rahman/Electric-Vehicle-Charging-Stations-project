const config = require('config');
let mysql = require('mysql');
let pool = null;
try {
  pool = mysql.createPool({
    connectionLimit: 10,
    host: config.get('database.host'),
    port: config.get('database.port'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.name'),
    multipleStatements: true
  });

} catch (error) {
  console.error('Mysql pool create failed');
  console.error(error);
}


const api = {
  query: (query, ...parameters) => {
    let promise = new Promise(function (resolve, reject) {
      pool.query(query, ...parameters, (error, results, fields) => {
        if (error) {
          reject(error)
        };

        resolve(results);
      })
    });

    return promise;
  },
  closeAll: () => {
    pool.end();
  }
};

module.exports = api;

