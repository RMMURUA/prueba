const dotenv = require('dotenv');
const db = require('./models');
const app = require('./app');

dotenv.config();

async function initServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    const port = 8080;
    app.listen(port, (err) => {
      if (err) {
        return console.error('Failed', err);
      }
      console.log(`Listening on port ${port}`);
      return `Listening on port ${port}`;
    });
  } catch (err) {
    console.log('Unable to connect to the database:', err);
    return err;
  }
  return 'App running successfully';
}

initServer();
