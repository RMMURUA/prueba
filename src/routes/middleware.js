const firebaseAdmin = require('firebase-admin');

function getAuth() {
  const auth = firebaseAdmin.auth();
  // const createUserFirebaseAuth = auth.createUser();
  return auth;
}

// Function that verifies the token in the header if the user is logged in.
async function checkIfLoggedIn(request, response, next) {
  // We obtian auth of FireBase
  const auth = getAuth();

  // We obtain the JWT
  const authToken = request.header('Authorization');

  // If there's not a "Authorization" in header, then it's Unauthorized.
  if (!authToken) {
    return response.status(403).json({ error: 'Unauthorized, you must login first!' });
  }

  try {
    // We verify the ID token
    const decodedToken = await auth.verifyIdToken(authToken);
    // We embbed the user info into the response
    request.currentToken = decodedToken;
    next();
  } catch (error) {
    // If there's been an error verifying the token, then it's not authorized to continue
    console.log('Token verification error:', error);
    return response.status(403).json({ error: 'Unauthorized, the given Token is corrupted, not verifiable. Please try again' });
  }
}

async function checkIfAdmin(request, response, next) {
  // This is meant to happen after authorized. We can get the user's permision inmediatly, and save it in the object.
  // We get the user's info through the request
  const decodedToken = request.currentToken;

  if (!decodedToken) { // The current user has not been loaded into the request correctly
    return response.status(500).json({ error: "You've had autenticated but we have encountered an internal error." });
  }

  try {
    // We need to look for the admin if exists.
    const admin = await request.orm.Admin.findOne({
      where: { uid_firebase: decodedToken.user_id },
      include: [
        {
          model: await request.orm.Permission,
        }
      ]
    });
    // If it doesn't exist, it inplies that the user is a logged doctor, not an Admin
    if (!admin){
      return response.status(403).json({ error: 'Unauthorized, you are not an Administrator.' });
    }
    // If the administrator does not have the Permissions, its creation has been faulty.
    if (!admin.Permissions) {
        return response.status(403).json({ 
          error: "Unauthorized, you are an Administrator but you don't have Permissions associated, there" +
          "must have been an error while making your profile. Seek Help from Support." });
      }

    // console.log(admin);
    // We look for each permission that the administrator has, 
    // and if it has the correct, it goes to the next function
    admin.Permissions.forEach((permission)=>{
      // console.log(permission);
      // console.log(permission.dataValues);
      // console.log(permission.dataValues.name);
      if (permission.dataValues.name !== "isAdministrator"){
        return response.status(403).json({ error: "you are a Admin but you don't have Permissions associated." });
      }
    });

    // In case we iterate in all the permissions but the wanted permission it not found,
    // it's not authorized.
    next();
  } catch (error) {
    // If there's been an error verifying the token, then it's not authorized to continue
    console.log('Token verification error:', error);
    return response.status(403).json({ error: 'Unauthorized, the given Token is corrupted, not verifiable. Please try again' });
  }
}


async function checkIfDoctor(request, response, next) {
  // This is meant to happen after authorized. We can get the user's permision inmediatly, and save it in the object.
  // We get the user's info through the request
  const decodedToken = request.currentToken;
  // console.log(decodedToken);

  if (!decodedToken) { // The current user has not been loaded into the request correctly
    return response.status(500).json({ error: "You've had autenticated but we have encountered an internal error." });
  }

  try {
    // We need to look for the doctor if exists.
    const doctor = await request.orm.Doctor.findOne({
      where: { uid_firebase: decodedToken.user_id },
      include: [
        {
          model: await request.orm.Permission,
        }
      ]
    });
    // If it doesn't exist, it applies that the user is a logged Administrator, not an doctor.
    if (!doctor){
      return response.status(403).json({ error: 'Unauthorized, you are not a Doctor to do the following.' });
    }
    // console.log(doctor);
    // If the Doctor does not have the Permissions, its creation has been faulty.
    if (!doctor.Permissions) {
        return response.status(403).json({ 
          error: "Unauthorized, you are an Doctor but you don't have Permissions associated, there" +
          "must have been an error while making your profile. Seek Help from Support." });
      }

    // We look for each permission that the Doctor has, 
    // and if it has the correct, it goes to the next function
    doctor.Permissions.forEach((permission)=>{
      // console.log(permission);
      // console.log(permission.dataValues);
      // console.log(permission.dataValues.name);
      if (permission.dataValues.name !== "isDoctor"){
        return response.status(403).json({ error: "you are a Doctor but you don't have Permissions associated." });
      }
    });

    // In case we iterate in all the permissions but the wanted permission it not found,
    // it's not authorized.
    next();
  } catch (error) {
    // If there's been an error verifying the token, then it's not authorized to continue
    console.log('Token verification error:', error);
    return response.status(403).json({ error: 'Unauthorized, the given Token is corrupted, not verifiable. Please try again' });
  }
}

module.exports = {
  checkIfLoggedIn,
  checkIfAdmin,
  checkIfDoctor,
};
