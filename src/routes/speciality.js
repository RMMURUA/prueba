// THESE ARE SEEDS TOO

const express = require('express');

const router = express.Router();
const { checkIfLoggedIn, checkIfAdmin } = require('./middleware.js');

function getcreateUserFirebaseAuth() {
  const auth = firebaseAdmin.auth();
  // const createUserFirebaseAuth = auth.createUser();
  return auth;
}

router.post('/create', checkIfLoggedIn, checkIfAdmin , async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED AS AN ADMINISTRATOR TO DO SO.
  try {
    const data = request.body;
    const { name } = data;

    // We need to look for the speciality (in case it does exist)
    const speciality = await request.orm.Speciality.findOne({ where: { name } });

    if (speciality !== null) {
      throw new Error('This speciality already exist');
    }

    const created_speciality = await request.orm.Speciality.create({
      name,
    });

    response.status(200).send({ msg: 'FOR ADMIN ONLY: CREATED SUCCESFULLY', speciality: created_speciality });
  } catch (error) {
    response.status(400).send({ msg: 'Error creating the speciality' });
  }
});

// (note to self, the transcription NOSQL object has a speciality, thus, the doctor needs to click one when
// Sending it to the proper route, this means that you need to check in the specific route if the speciality exists or not.)

router.get('/find/all', async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // BOTH DOCTOR AND ADMIN CAN GET THIS INFO
  try {
    const speciality = await request.orm.Speciality.findAll();

    response.status(200).send({ msg: 'OK', specialities: speciality });
  } catch (error) {
    response.status(400).send({ msg: 'Error finding the specialities', error: `${error}` });
  }
});

router.delete('/:name', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED AS AN ADMINISTRATOR TO DO SO.
  const speciality_name = request.params.name;
  try {
    const Speciality = await request.orm.Speciality.findOne({
      where: { name: speciality_name },
    });

    if (!Speciality) {
      throw new Error(`The Speciality of name: '${speciality_name}' does not exist.`);
    }

    await Speciality.destroy();

    response.status(200).send({ msg: 'The Speciality has been successfuly deleted.' });
  } catch (error) {
    response.status(400).send({ msg: 'Error while deleting Speciality.', error: `${error}` });
  }
});

module.exports = router;
