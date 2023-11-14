const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'SpeaknosisDevelop',
    password: process.env.DB_PASSWORD || 'evelopSpeaknosis2023',
    database: `${process.env.DB_NAME}` || 'Speaknosis-Backend-DB', // _development
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 8000,
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: `${process.env.DB_NAME}`, // _test
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: `${process.env.DB_NAME}`, // _production
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
};
