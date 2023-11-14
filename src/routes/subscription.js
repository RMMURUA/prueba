const express = require('express');

const router = express.Router();
const { checkIfLoggedIn } = require('./middleware.js');

function getcreateUserFirebaseAuth() {
  const auth = firebaseAdmin.auth();
  // const createUserFirebaseAuth = auth.createUser();
  return auth;
}

router.post('/create', checkIfLoggedIn, async (request, response) => {
  const data = await request.body;
  const { premium } = data;
  const { end_date } = data;
  const { start_date } = data;
  const { active } = data;
  const { token } = data;
  // This one SHOULD NOT BE USED.
  // USE THE ID IN THE JWT TO FIND THE USER.
  // Also, we need to prove the user bought the subscription
  // Before creating continuing.
  // This is an example only.
  const { doctor_id } = data;
  try {
    // Since we are externalizing the payment transaction
    // we have to handle the 402 http error: Payment required.

    // We need to look for the doctor (in case it doesn't exist)
    const doctor = await request.orm.Doctor.findOne({
      where: { id: doctor_id },
      include: request.orm.Subscription,
    });

    if (doctor === null) {
      throw new Error('This doctor does not exist.');
    }

    if (doctor.Subscription) {
      throw new Error('This doctor already owns a subscription.');
    }
    // We also need to check, as I said before, if the subscription is bought.
    // ...

    const created_subscription = await request.orm.Subscription.create({
      premium,
      end_date,
      start_date,
      active,
      token,
      doctor_id,
    });

    response.status(200).send({ msg: 'You now own a subscription!', subscription: created_subscription });
  } catch (error) {
    response.status(400).send({ msg: 'Error creating the subscription', error: `${error}` });
  }
});

router.get('/find/:id', checkIfLoggedIn, async (request, response) => {
  // This one SHOULD NOT BE USED.
  // USE THE ID IN THE JWT TO FIND THE USER.
  // Also, we need to prove the user bought the subscription
  // Before creating continuing.
  // This is an example only.
  const doctor_id = request.params.id;
  try {
    // We need to look for the doctor (in case it doesn't exist)
    const doctor = await request.orm.Doctor.findOne({
      where: { id: doctor_id },
      include: await request.orm.Subscription,
    });

    if (doctor === null) {
      throw new Error('This doctor does not exist.');
    }

    if (!doctor.Subscription) {
      throw new Error('This doctor does not have a subscription.');
    }

    response.status(200).send({ msg: 'Found your subscription.', subscription: doctor.Subscription });
  } catch (error) {
    response.status(400).send({ msg: 'Error finding the subscription', error: `${error}` });
  }
});

router.delete('/:id', checkIfLoggedIn, async (request, response) => {
  // This one SHOULD NOT BE USED.
  // USE THE ID IN THE JWT TO FIND THE USER.
  // Also, we need to prove the user bought the subscription
  // Before creating continuing.
  // This is an example only.
  const subscription_id = request.params.id;
  try {
    const Subscription = await request.orm.Subscription.findOne({
      where: { id: subscription_id },
      include: await request.orm.Doctor,
    });

    if (Subscription === null) {
      throw new Error('Can not delete a Subscription of a Doctor that does not exit.');
    }

    if (!Subscription.Doctor) {
      // We have to manage the case of doctor without a subscription
      // like redirect to the payment module.
      throw new Error('Can not delete Subscription because Doctor does not have one.');
    }

    await Subscription.destroy();

    response.status(200).send({ msg: 'The Subscription has been successfuly deleted.' });
  } catch (error) {
    response.status(400).send({ msg: 'Error while deleting Subscription', error: `${error}` });
  }
});

module.exports = router;
