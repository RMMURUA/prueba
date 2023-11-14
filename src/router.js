const express = require('express');
const db = require('./models/index');
const router = express.Router();

// const { User } = require('../config')();

const patient = require('./routes/patient');
const speciality = require('./routes/speciality');
const permision = require('./routes/permission');
const subscription = require('./routes/subscription');
const manage_transcript = require('./routes/manage_transcript');
// const user = require('./routes/user');
const transcript = require('./routes/transcript');

router.use('/manage_transcript', manage_transcript);
router.use('/subscription', subscription);
router.use('/speciality', speciality);
router.use('/permision', permision);
router.use('/patient', patient);
// router.use('/user', user);
router.use('/transcript', transcript);

// user.User = User;

router.get('/', (req, response) => {
  response.send('Hello world!');
});

// router.delete('/', async (req, res) => {
//   // await db.sequelize.destroyAll();
//   await db.sequelize.sync({ force: true });

//   // Run the seed function from the seed file
//   await seed.up(db.sequelize.queryInterface, db.sequelize.Sequelize);
//   res.status(201).json({
//     msg: 'Success',
//   });
// });

module.exports = router;
