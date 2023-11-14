const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {};

// const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
const sequelize = new Sequelize(config.database, config.username, config.password, {
  dialect: 'postgres',
  dialectModule: pg,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  logging: process.env.NODE_ENV === 'test' ? false : console.log,
});
// }

fs.readdirSync(__dirname)
  .filter((file) => (
    file.indexOf('.') !== 0
      && file !== basename
      && file.slice(-3) === '.js'
      && file.indexOf('.test.js') === -1
  ))
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');

// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(`${__dirname}/../config/config.js`)[env];
// const db = {};

// let sequelize;

// const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
// // if (config.use_env_variable) {
// //   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// // } else {
// sequelize = new Sequelize(config.database, config.username, config.password, {
//   dialect: 'postgres',
//   dialectModule: require('pg'),
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
// });
// // }

// fs.readdirSync(__dirname)
//   .filter((file) => (
//     file.indexOf('.') !== 0
//       && file !== basename
//       && file.slice(-3) === '.js'
//       && file.indexOf('.test.js') === -1
//   ))
//   .forEach((file) => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;

// module.exports = db;
