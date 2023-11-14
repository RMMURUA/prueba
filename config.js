require('dotenv').config();
const firebaseAdmin = require('firebase-admin');

function setupConfig() {
  try {
    const speaknosisCredentials = JSON.parse(process.env.SPEAKNOSIS_BACKEND_CREDENTIALS);
    //const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);
    //const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

    // firebaseAdmin.initializeApp({
    //   credential: firebaseAdmin.credential.cert(serviceAccount),
    //   firebaseConfig,
    // });

    // We initialize the non-relational database
    //const db = firebaseAdmin.firestore();
    //const User = db.collection('Users');
    //const TranscriptionsFireBase = db.collection('Transcription');

    // const auth = firebaseAdmin.auth();
    return {
      // User, TranscriptionsFireBase, speaknosisCredentials, auth,
      // User
    }; // , SQL };
  } catch (error) {
    console.error('Error setting up config:', error);
    return error;
  }
}

module.exports = setupConfig;
