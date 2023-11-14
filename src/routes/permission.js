// Maybe permission should be created as a seed, and not a as query. But, we could also make
// admins be able to create permissions.

const express = require('express');

const router = express.Router();
const { checkIfLoggedIn } = require('./middleware.js');

function getcreateUserFirebaseAuth() {
  const auth = firebaseAdmin.auth();
  // const createUserFirebaseAuth = auth.createUser();
  return auth;
}

router.get('/getAll', checkIfLoggedIn, async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED AS AN ADMINISTRATOR TO DO SO.
  try {
    const permissions = await request.orm.Permission.findAll();
    if (!permissions) {
      throw new Error('There is no permission available, create new ones or run a seed.');
    }

    response.status(200).send({ msg: 'Successful retrival of data.', permissions });
  } catch (error) {
    response.status(400).send({ msg: 'Unsucessful retrival of data.', error: `${error}` });
  }
});

router.post('/create', checkIfLoggedIn, async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED AS AN ADMINISTRATOR TO DO SO.
  const data = await request.body;
  const { name } = data;
  try {
    // Check if the permission already exists
    const permission_success = await request.orm.Permission.findOne({
      where: { name },
    });

    if (permission_success) {
      throw new Error(`The Permission: '${name}' already exists.`);
    }

    const created_permission = await request.orm.Permission.create({ name });

    response.status(200).send({ msg: 'New Permission added successfuly.', permissions: created_permission });
  } catch (error) {
    response.status(400).send({ msg: 'The new Permission could not be added to the database.', error: `${error}` });
  }
});

router.post('/del', checkIfLoggedIn, async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED AS AN ADMINISTRATOR TO DO SO.
  const permission_id = await request.body.id;
  try {
    const Permission = await request.orm.Permission.findOne({
      where: { id: permission_id },
    });

    if (!Permission) {
      throw new Error(`The Permission of id: '${permission_id}' does not exists.`);
    }

    await Permission.destroy();

    response.status(200).send({ msg: 'The Permission has been successfuly deleted.' });
  } catch (error) {
    response.status(400).send({ msg: 'Error while deleting Permission.', error: `${error}` });
  }
});

module.exports = router;
