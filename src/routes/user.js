const express = require('express');

const router = express.Router();
const firebaseAdmin = require('firebase-admin');
const { Op } = require('sequelize');
const { checkIfLoggedIn, checkIfAdmin, checkIfDoctor } = require('./middleware.js');
const { getFirebaseIdToken } = require('../helpers/get_firebase_token.js');

function getcreateUserFirebaseAuth() {
  const auth = firebaseAdmin.auth();
  // const createUserFirebaseAuth = auth.createUser();
  return auth;
}

// If you want to login/register, this is not the way. You need to create the user
// When you register in the auth module. Then, whenever you want to find this user
// You need to look for his special ID sent in the JWT that the auth module gave you
// After you get the ID, just look for the user that owns it. This means that there
// has to be a special column that represents the ID.(Change sequelize model to do that)

// I forgor ((((IMPORTANT)))): Doctor should be able to select a speciality when creating itself. (remember to fix that)
// then when creating, check if the speciality does in fact exist.
router.post('/doctor/create', async (request, response) => {
  // THIS DOES NOT REQUIRE JWT
  const auth = getcreateUserFirebaseAuth();

  let userCredential; let token;
  try {
    const data = await request.body;
    const { dni } = data;
    const { name } = data;
    const { email } = data;
    const { password } = data;
    // Let's chech for the specialiity
    const { speciality } = data;

    // We need to look for the doctor (in case it exists already)
    const already_doctor = await request.orm.Doctor.findOne({
      where: {
        [Op.or]: [
          { dni },
          { email },
        ],
      },
    }); // <--- HERE

    if (already_doctor) {
      throw new Error('This User already exists', { type: 1 });
    }

    if (speciality.length == 0) {
      throw new Error('You need to add at least one speciality.', { type: 1 });
    }

    // WE NEED TO PUT UNIQUE IN MIGRATION AND ALSO, HERE, CHECK IF MAIL
    let speciality_list;
    if (speciality.includes(";")){
      speciality_list = speciality.split(';');
    } else {
      speciality_list = [speciality];
    }
    for (let i = 0; i < speciality_list.length; i++) {
      const does_exist_speciality = await request.orm.Speciality.findOne({ where: { name: speciality_list[i] } });

      if (!does_exist_speciality) {
        throw new Error('This Speciality does not exist, please contact Support.', { type: 1 });
      }
    }

    if (name.length < 3 || name.length > 30) {
      throw new Error('Please, use Name and Last Name', { type: 1 });
    }
    if (dni.length < 9 || dni.length > 11 || !dni.includes("-")) {
      throw new Error('Dni has the wrong length or it does not include "-" followed by the last digit.', { type: 1 });
    }
    if (!email.includes('@')) {
      throw new Error('Email format is incorrect. Must have a "@".', { type: 1 });
    }

    if (password.length < 6){
      throw new Error('The Password must be at least 6 characters.', { type: 1 })
    }

    const created_doctor = await request.orm.Doctor.create({
      dni,
      name,
      email,
    });

    for (let i = 0; i < speciality_list.length; i++) {
      const does_exist_speciality = await request.orm.Speciality.findOne({ where: { name: speciality_list[i] } });
      // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
      await does_exist_speciality.addDoctor(created_doctor);
    }

    const does_permission_exist = await request.orm.Permission.findOne({ where: { name: "isDoctor"}});
    await does_permission_exist.addDoctor(created_doctor);

    try { // CAUTION: We need this function to only run after created_doctor works
      // But if it fails, then we need to delete the created doctor...
      userCredential = await auth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
        disabled: false,
      });
      await created_doctor.update({ uid_firebase: userCredential.uid });
    } catch (error) {
      // If Firebase throws an error, we delete the created doctor
      await created_doctor.destroy();
      // CAREFUL
      throw new Error(`Firebase Authentication failed.${error.message}`, { type: 2 });
    }

    try {
      // We create the token
      token = await auth.createCustomToken(userCredential.uid);
    } catch (error) {
      throw new Error(`The Token's creation has been unsuccesfull. ${error.message}`, { type: 2 });
    }

    response.status(200).send({ msg: 'User added successfully!', doctor: created_doctor, custom_token: token });
  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg: "Error creating the user. Client's error.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error creating the user. Server's error.", error: `${error}` });
    }
  }
});

// from here on, we'll deal with methods that are restricted, because they are private
// And requiere a JWT in order to work, if not you'll be kicked because you aren't authorized

// We need to add a list for the doctor to see their patients.

// the current route is fixed for develop, it should be: '/doctor/profile' in production.
router.get('/doctor/profile', checkIfLoggedIn, checkIfDoctor, async (request, response) => {
  const decodedToken = request.currentToken;
  //const offest = (page - 1) * 10;
  // THIS DOES REQUIRE JWT (It gives you your own data)
  try {
    // We need to look for the doctor (in case it exists already)
    const doctor = await request.orm.Doctor.findOne({
      where: { uid_firebase: decodedToken.user_id },
      include: [
        {
          model: await request.orm.Speciality,
        },
        {
          model: await request.orm.Subscription,
        },
        {
          model: await request.orm.Transcription,
          include: {
            model: await request.orm.Patient,
          },
          //limit: 5,
        },
      ],
    });

    if (!doctor) {
      throw new Error('The doctor does not exist.');
    }

    response.status(200).send({ msg: 'User found', doctor: doctor });
  } catch (error) {
    response.status(404).send({ msg: 'Error: user not found', error: `${error}` });
  }
});

router.put('/doctor/update/credentials', checkIfLoggedIn, checkIfDoctor, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  let doctor_to_update;
  let already_doctor;
  let updated_doctor;
  try {
    const data = await request.body;
    const { email } = data;
    const { password } = data;

    // We need to look for the doctor (in case it exists already)
    doctor_to_update = await request.orm.Doctor.findOne({ 
      where: { uid_firebase: decodedToken.user_id },
    });

    if (!doctor_to_update) {
      throw new Error('This Doctor does not exist.', { type: 1 });
    }

    if (email !== doctor_to_update.email){
      already_doctor = await request.orm.Doctor.findOne({ 
        where: { email: email },
      });
  
      if (already_doctor){
        throw new Error('This Email is already on use.', { type: 1 });
      }
    }
    
    const old_email = doctor_to_update.email;

    if (!email.includes('@') && !email.includes('.')) {
      throw new Error('Wrong email format.', { type: 1 });
    }

    if (password.length < 6){
      throw new Error('The Password must be at least 6 characters.', { type: 1 })
    }
    // We update the relational representation of the Doctor.
    try {
      updated_doctor = await doctor_to_update.update({
        email,
      });
    } catch (error) {
      throw new Error(`Failed to update the email and password on the Relational Database. Error: '${error.message}'.`, { type: 2 });
    }
    // We update the firebase representation of the Doctor.
    try {
      const userCredential = await auth.updateUser(updated_doctor.uid_firebase, 
        {
          email: email,
          password: password,
        });
    } catch(error) {
      // Undo the updated Doctor in the Relational Database.
      updated_doctor = await updated_doctor.update({ // INSTEAD OF DOCTOR TO UPDATE - ruter
        email: old_email,
      });
      throw new Error(`Failed to update the email and password on the Firebase Authentication. '${error.message}'.`, { type: 2 });
    };

    // If nothing throws error, means we've updated succesfully.
    response.status(200).send({ msg: 'Doctor updated successfully!', doctor: updated_doctor });

  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg: "Error updating the email and password of the doctor. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error updating the email and password of the doctor. Server's side.", error: `${error}` });
    }
  }
});

router.put('/doctor/update/specialities', checkIfLoggedIn, checkIfDoctor, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  let old_specialities;
  let doctor_to_update;
  try {
    const data = await request.body;
    // Let's chech for the specialiity
    const { speciality } = data;

    // We need to look for the doctor (in case it exists already)
    doctor_to_update = await request.orm.Doctor.findOne({ 
      where: { uid_firebase: decodedToken.user_id },
      include: [
        {
          model: await request.orm.Speciality,
        }
      ],
    });

    old_specialities = doctor_to_update.Specialities;

    if (!doctor_to_update) {
      throw new Error('This Doctor does not exist.', { type: 1 });
    }
    
    if (speciality.length == 0) {
      throw new Error('You need to add at least one speciality.', { type: 1 });
    }

    let speciality_list;
    if (speciality.includes(";")){
      speciality_list = speciality.split(';');
    } else {
      speciality_list = [speciality];
    }

    for (let i = 0; i < speciality_list.length; i++) {
      const does_exist_speciality = await request.orm.Speciality.findOne({ where: { name: speciality_list[i] } });

      if (!does_exist_speciality) {
        throw new Error('This Speciality does not exist, please contact Support.', { type: 2 });
      }
    }

    // We clear the current specilities the doctor has.
    await request.orm.DoctorSpeciality.destroy({ where: { doctor_id: doctor_to_update.id } });

    // To then add the new ones.
    for (let i = 0; i < speciality_list.length; i++) {
      const does_exist_speciality = await request.orm.Speciality.findOne({ where: { name: speciality_list[i] } });
      // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
      await does_exist_speciality.addDoctor(doctor_to_update);
    }

    // We look for the updated new version.
    const doctor_updated = await request.orm.Doctor.findOne({ 
      where: { uid_firebase: decodedToken.user_id },
      include: [
        {
          model: await request.orm.Speciality,
        }
      ],
    });
    
    // If nothing throws error, means we've updated succesfully.
    response.status(200).send({ msg: "Doctor's specialities updated successfully!", doctor: doctor_updated });

  } catch (error) {
    // Undo the Specialities update
    // We first detroy the new Specialities association
    await request.orm.DoctorSpeciality.destroy({ where: { doctor_id: doctor_to_update.id } });
    // Then we restablish the old ones.
    for (let i = 0; i < old_specialities.length; i++) {
      const does_exist_speciality = await request.orm.Speciality.findOne({ where: { name: old_specialities[i].name }});
      // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
      await does_exist_speciality.addDoctor(doctor_to_update);
    }
    if (error.type === 1){
      response.status(400).send({ msg: "Error updating the the doctor. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error updating the the doctor. Server's side.", error: `${error}` });
    }
  }
});

router.put('/doctor/update/data', checkIfLoggedIn, checkIfDoctor, async (request, response) => {
  // THIS DOES REQUIRE JWT, AND ALSO, UPDATE FIREBASE O.o
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  let updated_doctor;
  try {
    const data = await request.body;
    const { dni } = data;
    const { name } = data;

    // We need to look for the doctor (in case it exists already)
    const doctor_to_update = await request.orm.Doctor.findOne({ 
      where: { uid_firebase: decodedToken.user_id }});
    const already_doctor = await request.orm.Doctor.findOne({ where: { dni } });

    if (!doctor_to_update) {
      throw new Error('This Doctor does not exist.', { type: 1 });
    }

    if (already_doctor) {
      if (already_doctor.id !== doctor_to_update.id && dni === already_doctor.dni) {
        throw new Error('This Dni is already in use.', { type: 1 });
      }
    }

    if (name.length < 3 || name.length > 30) {
      throw new Error('Please, use Name and Last Name.', { type: 1 });
    }
    
    if (dni.length < 9 || dni.length > 11 || !dni.includes("-")) {
      throw new Error('Dni has the wrong length or it does not include "-" followed by the last digit.', { type: 1 });
    }
    
    const old_name = doctor_to_update.name;
    const old_dni = doctor_to_update.dni;
    
    // We try to update the doctor in both the relational database and firebase.

    // We update relational Database.
    try {
      updated_doctor = await doctor_to_update.update({
        dni,
        name,
      });
    } catch (error) {
      // Undo the updated doctor
      updated_doctor = await doctor_to_update.update({
        dni: old_dni,
        name: old_name,
      });
      throw new Error("There's been an error while updating the Doctor's personal info in the Relational Database." + `${error}`, { type: 2 });
    }

    // We update the Firebase Authentification
    try {
      const userCredential = await auth.updateUser(updated_doctor.uid_firebase, {
        displayName: name,
      });
    } catch (error){
      // We undo the updated doctor in both the relational database and firebase.
      updated_doctor = await doctor_to_update.update({
        dni: old_dni,
        name: old_name,
      });
      const userCredential = await auth.updateUser(updated_doctor.uid_firebase, {
        displayName: old_name,
      });

      throw new Error("There's been an error while updating the Doctor's personal info in the Firebase Authentification." + `${error}`, { type: 2 });
    }
    // If nothing throws error, means we've updated succesfully.
    response.status(200).send({ msg: 'Doctor updated successfully!', doctor: updated_doctor });
  } catch (error) {
    if (error.type === 1) {
      response.status(400).send({ msg: "Error updating the Doctor. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error updating the Doctor. Server's side.", error: `${error}` });
    }
  }
});

// Fix in front (delete token when called)
router.delete('/doctor/deleteMyself', checkIfLoggedIn, checkIfDoctor, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  try {
    // First we find the current doctor.
    const doctor_to_delete = await request.orm.Doctor.findOne({ 
      where: { uid_firebase: decodedToken.user_id }});
    
    if (!doctor_to_delete) {
      throw new Error('This Doctor does not exist. Can not delete it.');
    }
    
    // Delete the Doctor from Firebase
    try {
      await auth.deleteUser(doctor_to_delete.uid_firebase);
    } catch (error){
      throw new Error('There has been an error while deleteing the Doctor from the Firebase Authentification. Please seek help from Suppor.' + `${error}`);
    }

    // Delete the doctor From Relational Database
    try {
      await doctor_to_delete.destroy();
    } catch (error){
      throw new Error('There has been an error while deleting the Doctor from the Relational Database. Please seek help from Support.' + `${error}`);
    }

    response.status(204).send({ msg : 'The Doctor has been deleted successfully!'});
  } catch (error) {
    response.status(500).send({ msg : 'Failed to delete the Doctor.', error: `${error}` });
  }
});

// This is meant to be an UPDATE route, not a "create admin", because Administrators are
// made with a seed and not created by another amdinistrador.
router.post('/admin/create', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  // THIS DOES REQUIRE A JWT and it has to belong to an Administrator
  const auth = getcreateUserFirebaseAuth();

  let userCredential;
  try {
    const data = await request.body;
    const { dni } = data;
    const { name } = data;
    const { email } = data;
    const { password } = data;

    // We need to look for the admin (in case it exists already)
    const admin = await request.orm.Admin.findOne({
      where: {
        [Op.or]: [
          { dni },
          { email },
        ],
      },
    }); // <--- HERE

    if (admin) {
      throw new Error('This User already exists', { type: 1 });
    }

    if (name.length < 3 || name.length > 30) {
      throw new Error('Please, use Name and Last Name', { type: 1 });
    }
    if (dni.length < 9 || dni.length > 11 || !dni.includes("-")) {
      throw new Error('Dni has the wrong length or it does not include "-" followed by the last digit.', { type: 1 });
    }
    if (!email.includes('@')) {
      throw new Error('Email format is incorrect.', { type: 1 });
    }

    const created_admin = await request.orm.Admin.create({
      dni,
      name,
      email,
    });

    const does_permission_exist = await request.orm.Permission.findOne({ where: { name: "isAdmin"}});
    await does_permission_exist.addAdmin(created_admin);

    try { 
      // CAUTION: We need this function to only run after admin_doctor works
      // But if it fails, then we need to delete the created admin...
      userCredential = await auth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
        disabled: false,
      });
      await created_admin.update({ uid_firebase: userCredential.uid });
    } catch (error){
      // If Firebase throws an error, we delete the created admin.
      await created_admin.destroy();
      throw new Error(`Firebase Authentication failed.${error.message}`, { type: 2 });
    }

    if (created_admin) {
      response.status(200).send({ msg: 'User added successfully!', admin: created_admin });
    } else {
      throw new Error('Error while creating Administrator in the DB model.');
    }
  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg: "Error while creating the Administrator. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error while creating the Administrator. Server's side.", error: `${error}` });
    }
  }
});

// the current route is fixed for develop, it should be: '/admin/profile' in production.
router.get('/admin/profile', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  // THIS DOES REQUIRE JWT (it gives you your own data)
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  try {
    // We need to look for the admin (in case it exists already)
    const admin = await request.orm.Admin.findOne({ where: { uid_firebase: decodedToken.user_id } });

    if (!admin) {
      throw new Error('The Admin does not exist');
    }
    response.status(200).send({ msg: 'Administrator found.', administrator: admin });
  } catch (error) {
    response.status(500).send({ msg: "Error: user not found. Server's side.", error: `${error}` });
  }
});

// Add a route that offers the posibility to update the doctors data (everything but the DNI)
// This route must be connected (somehow) to the auth system.

router.put('/admin/update/credentials', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  let admin_to_update;
  let already_admin;
  let updated_admin;
  try {
    const data = await request.body;
    const { email } = data;
    const { password } = data;

    // We need to look for the Admin (in case it exists already)
    admin_to_update = await request.orm.Admin.findOne({ 
      where: { uid_firebase: decodedToken.user_id },
    });

    if (!admin_to_update) {
      throw new Error('This Administrator does not exist.', { type: 1 });
    }

    if (email !== admin_to_update.email){
      already_admin = await request.orm.Admin.findOne({ 
        where: { email: email },
      });

      if (already_admin){
        throw new Error('This Email is already in use.', { type: 1 });
      }
    }
    
    const old_email = admin_to_update.email;

    if (!email.includes('@') && !email.includes('.')) {
      throw new Error('Wrong email format.', { type: 1 });
    }

    if (password.length < 6){
      throw new Error('The Password must be at least 6 characters.', { type: 1 })
    }
    // We update the Relational Database representation of the Admin.
    try {
      updated_admin = await admin_to_update.update({
        email,
      });
    } catch (error) {
      throw new Error(`Failed to update the email and password on the Relational Database. Error: '${error.message}'.`, { type: 2 });
    }
    // We update the firebase representation of the Admin.
    try {
      const userCredential = await auth.updateUser(updated_admin.uid_firebase, 
        {
          email: email,
          password: password,
        });
    } catch(error) {
      // Undo the updated Admin in the Relational Database.
      updated_admin = await updated_admin.update({ 
        email: old_email,
      });
      throw new Error(`Failed to update the email and password on the Firebase Authentication. '${error.message}'.`, { type: 2 });
    };

    // If nothing throws error, means we've updated succesfully.
    response.status(200).send({ msg: 'Doctor updated successfully!', doctor: updated_admin });

  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg: "Error updating the email and password of the doctor. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error updating the email and password of the doctor. Server's side.", error: `${error}` });
    }
  }
});

router.put('/admin/update/data', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  // THIS DOES REQUIRE A JWT
  // YOU ALSO NEED TO BE AUTHORIZED
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  let updated_admin;
  try {
    const data = request.body;
    const { dni } = data;
    const { name } = data;

    // We need to look for the admin (in case it exists already)
    const admin_to_update = await request.orm.Admin.findOne({ 
      where: { uid_firebase: decodedToken.user_id }});
    const already_admin = await request.orm.Admin.findOne({ where: { dni } });
    
    if (!admin_to_update) {
      throw new Error('This Administrator does not exists.', { type: 1 });
    }

    if (already_admin) {
      if (already_admin.id !== admin_to_update.id && dni === already_admin.dni) {
        throw new Error('This ni is already in use.', { type: 1 });
      }
    }

    if (name.length < 3 || name.length > 30) {
      throw new Error('Please, use Name and Last Name.', { type: 1 });
    }
    if (dni.length < 9 || dni.length > 11 || !dni.includes("-")) {
      throw new Error('Dni has the wrong length or it does not include "-" followed by the last digit.', { type: 1 });
    }

    const old_name = admin_to_update.name;
    const old_dni = admin_to_update.dni;

    // We try to update the Administrator in both the relational database and firebase.

    // We update relational Database.
    try {
      updated_admin = await admin_to_update.update({
        dni,
        name,
      });

    } catch (error) {
      // Undo the updated doctor
      updated_admin = await admin_to_update.update({
        dni: old_dni,
        name: old_name,
      });
      throw new Error("There's been an error while updating the Administrator's personal info in the Relational Database." + `${error}`, { type: 1 });
    }

    // We update the Firebase Authentification
    try {
      const userCredential = await auth.updateUser(updated_admin.uid_firebase, {
        displayName: name,
      });
    } catch (error){
      // We undo the updated Administrator in both the relational database and firebase.
      updated_admin = await admin_to_update.update({
        dni: old_dni,
        name: old_name,
      });
      const userCredential = await auth.updateUser(updated_admin.uid_firebase, {
        displayName: old_name,
      });

      throw new Error("There's been an error while updating the Administrator's personal info in the Firebase Authentification." + `${error}`, { type: 2 });
    }

    // If nothing throws error, means we've updated succesfully.
    response.status(200).send({ msg: 'Administrator updated successfully!', admin: updated_admin });
  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg: "Error updating the Administrator. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg: "Error updating the Administrator. Server's side.", error: `${error}` });
    }
  }
});

// Fix in front (delete token when called)
router.delete('/admin/deleteMyself', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const decodedToken = request.currentToken;
  try {
    // First we find the current Admin.
    const admin_to_delete = await request.orm.Admin.findOne({ 
      where: { uid_firebase: decodedToken.user_id }});
    
    if (!admin_to_delete) {
      throw new Error('This Administrator does not exist. Can not delete it.', { type: 1 });
    }
    
    // Delete the Admin from Firebase
    try {
      await auth.deleteUser(admin_to_delete.uid_firebase);
    } catch (error){
      throw new Error('There has been an error while deleteing the Administrator from the Firebase Authentification. Please seek help from Suppor.' + `${error}`, { type: 2 });
    }

    // Delete the Admin From Relational Database
    try {
      await admin_to_delete.destroy();
    } catch (error){
      throw new Error('There has been an error while deleting the Administrator from the Relational Database. Please seek help from Support.' + `${error}`, { type: 2 });
    }

    response.status(204).send({ msg : 'The Administrator has been deleted successfully!'});
  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg : "Failed to delete the Administrator. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg : "Failed to delete the Administrator. Server's side.", error: `${error}` });
    }
  }
});

router.delete('/admin/deleteDoctor/:id', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  const auth = getcreateUserFirebaseAuth();
  const { id } = request.params.id;
  try {
    // First we find the current doctor.
    const doctor_to_delete = await request.orm.Doctor.findOne({ 
      where: { id : id }});
    
    if (!doctor_to_delete) {
      throw new Error('This Doctor does not exist. Can not delete it.', { type: 1 });
    }
    
    // Delete the Doctor from Firebase
    try {
      await auth.deleteUser(doctor_to_delete.uid_firebase);
    } catch (error){
      throw new Error('There has been an error while deleteing the Doctor from the Firebase Authentification. Please seek help from Suppor.' + `${error}`, { type: 2 });
    }

    // Delete the doctor From Relational Database
    try {
      await doctor_to_delete.destroy();
    } catch (error){
      throw new Error('There has been an error while deleting the Doctor from the Relational Database. Please seek help from Support.' + `${error}`, { type: 2 });
    }

    response.status(204).send({ msg : 'The Doctor has been deleted successfully!'});
  } catch (error) {
    if (error.type === 1){
      response.status(400).send({ msg : "Failed to delete the Doctor. Client's side.", error: `${error}` });
    } else {
      response.status(500).send({ msg : "Failed to delete the Doctor. Server's side.", error: `${error}` });
    }
  }
});

// Vista para poder ver todos los doctores (para admin)

router.get('/admin/seeDoctors/:page', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  try {
    const { page } = request.params.page;
    const offest = (page - 1) * 10;
    const doctors = await request.orm.Doctor.findAll({
      limit: 10,
      offset: offest,
      include: [
        {
          model: await request.orm.Speciality,
        },
        {
          model: await request.orm.Subscription,
        },
        {
          model: await request.orm.Transcription,
          include: {
            model: await request.orm.Patient,
          },
        },
      ]
    });
    response.status(200).send({ msg : 'Success retrieving the Doctors!', doctors: doctors});
  } catch (error) {
    response.status(500).send({ msg : "Failed to fetch all the Doctors. Server's side", error: `${error}` });
  }
});

// Vista para poder ver datos de un doctor (para admin)

router.get('/admin/doctor/:id', checkIfLoggedIn, checkIfAdmin, async (request, response) => {
  try {
    const { id } = request.params.id;
    const doctor = await request.orm.Doctor.findOne({
      where: { id: id},
      include: [
        {
          model: await request.orm.Speciality,
        },
        {
          model: await request.orm.Subscription,
        },
        {
          model: await request.orm.Transcription,
          include: {
            model: await request.orm.Patient,
          },
        },
      ],
    });

    if (!doctor) {
      throw new Error('The doctor does not exist.');
    }
    
    response.status(200).send({ msg : 'doctor', doctors: doctor});
  } catch (error) {
    response.status(500).send({ msg : "Failed to fetch all the Doctors. Server's side.", error: `${error}` });
  }
});


router.get('/doctor/getToken', async (request, response) => {

  try {
  
  const data = await request.body;
  const { email } = data;
  const { password } = data;

  if (!email || !password) {
    throw new Error('Email or password not provided');
  }

  const token = await getFirebaseIdToken(email, password);

  response.status(200).send({ msg: 'User found', token: token });

  } catch (error) {
    response.status(404).send({ msg: 'Error: user invalid credentials', error: `${error}` });
  }
});
// We need to limit the patients that are gotten when a doctor ask for patients in the GET request!
// (Maybe, create a specific request to get patients based on doctor id conected to the transcription data)

module.exports = router;

// WHEN ENTERING DOCTOR VIEW, OR TO RECORD A FILE, MAKE FRONTEND UPDATE IDTOKEN SO IT LASTS A LOT, BECAUSE IT MIGHT FAIL
