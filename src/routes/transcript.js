// const { Storage } = require('@google-cloud/storage');
// const express = require('express');
// const dotenv = require('dotenv');
// dotenv.config();


// const router = express.Router();
// const axios = require('axios');
// const multer = require('multer');

// const firebaseAdmin = require('firebase-admin');
// const { checkIfLoggedIn } = require('./middleware');
// const { error } = require('firebase-functions/logger');

// function getcreateUserFirebaseAuth() {
//   const auth = firebaseAdmin.auth();
//   // const createUserFirebaseAuth = auth.createUser();
//   return auth;
// }

// // We import firebase
// function getTranscriptionFireBase() {
//   const db = firebaseAdmin.firestore();
//   const TranscriptionsFireBase = db.collection('Transcription');
//   return TranscriptionsFireBase;
// }

// const upload = multer({ storage: multer.memoryStorage() });
// // const speaknosisCredentials = module.exports.speaknosisCredentials;
// const speaknosisCredentials = JSON.parse(process.env.SPEAKNOSIS_BACKEND_CREDENTIALS);

// const storage = new Storage({
//   credentials: speaknosisCredentials,
//   projectId: 'Speaknosis-Backend',
// });

// // Function that uploads to the Google Cloud Bucket
// async function uploadFile(bucketName, destinationPath, data) {
//   try {
//     await storage.bucket(bucketName).file(destinationPath).save(data);
//     console.log('File uploaded to bucket successfully.');
//   } catch (error) {
//     console.log('Error uploading to bucket.');
//     throw error;
//   }
// }

// router.get('/audio/:id_doctor_get/:id_patient_get', async (req, res) => {
//   const bucketName = 'bucket-speaknosis-backend';
//   const bucket = storage.bucket(bucketName);

//   const { id_patient_get, id_doctor_get } = req.params;
//   const timestamp_get = Date.now();
//   // const fileName = `${id_doctor_get}_${id_patient_get}_${timestamp_get}.wav`;
//   const fileName = `audios/audio_${id_doctor_get}_${id_patient_get}_${timestamp_get}.wav`;
//   console.log(id_doctor_get);
//   const file = bucket.file(fileName);

//   const options = {
//     version: 'v4',
//     action: 'write',
//     expires: timestamp_get + 15 * 60 * 1000, // 15 minutos
//     'content-type': 'audio/wav',
//     HttpMethod: 'GET',
//   };

//   // URL firmado
//   const [url] = await file.getSignedUrl(options);
//   console.log(url);
//   res.send({ url, fileName, timestamp_get });
// });

// router.post('/create', async (req, res) => {
//   const { doctor_id, patient_id, firebase_key } = req.body;

//   const sql_transcription_success = await req.orm.Transcription.create({
//     doctor_id,
//     patient_id,
//     firebase_key,
//   });

//   if (!sql_transcription_success) {
//     throw new Error('The Transcription was not saved at Postgress correctly.');
//   }

//   res.status(201).json({
//     msg: 'Success',
//   });
// });

// // router.post('/upload/:id_doctor/:id_patient', checkIfLoggedIn, upload.single('file'), async (req, res) => {
// router.post('/upload/:id_doctor/:id_patient', upload.single('file'), async (req, res) => {
// // router.post('/upload/:id_doctor/:id_patient', async (req, res) => {
//   try {
//     // TEST
//     const audioFile = req.file;
//     const audioData = audioFile.buffer;
//     const timestamp = new Date().getTime();

//     // TEST

//     // const timestamp = req.body.timestamp;
//     const { id_patient, id_doctor } = req.params;


//     const requestData = {
//       timestamp: timestamp,
//     };

//     // TEST
//     const destinationPath = `audios/audio_${id_doctor}_${id_patient}_${timestamp}.wav`;
//     await uploadFile('bucket-speaknosis-backend', destinationPath, audioData);
//     // //TEST

//     const jobmasterUrl = process.env.JOBMASTER_URL || 'http://localhost';
//     const jobmasterPort = process.env.JOBMASTER_PORT || 3000;

//     const jobCreationResponse = await axios.post(`${jobmasterUrl}:${jobmasterPort}/work/${id_doctor}/${id_patient}`, requestData)
//     const jobId = jobCreationResponse.data.jobId;

//     if (!jobId) {
//       throw new error('Job creation failed.');
//     }


//     let jobCompleted = false;
//     let jobmasterResponse;
//     let firebase_id;
//     while (!jobCompleted) {
//       jobmasterResponse = await axios.get(`${jobmasterUrl}:${jobmasterPort}/work/state/${jobId}`)
//       const { job, jobState } = jobmasterResponse.data;
//       // console.log('JOB', job);
//       // jobState = await job.getState();
//       // const jobState = stateResponse.data.state;
//       console.log('JOB STATE', jobState)
//       /// console.log('HOLA');
//       if (jobState === 'completed') {
//         jobCompleted = true;
//         firebase_id = job.returnvalue;
//         // console.log('JOB', job);
//         // console.log('firebase id en loop:', firebase_id);
//       }
//       else {
//         await new Promise((resolve) => setTimeout(resolve, 15000));
//       }
//     }

//     res.status(200).json({ firebase_id: firebase_id, msg: 'Transcription process finalized successfully.' });

//     // We save the transcription, the bucket of the text file and audio into the cloud (Firebase)
//     // THE TOKEN MUSTN'T BE NULL, WE HAVE TO HANDLE IT IN CYCLE 2.
//     // const TranscriptionsFireBase = getTranscriptionFireBase();
//     // await saveTrancription(null, jsonSummary, bucketName + transcriptFolder + transcriptFileName, gcsInputUri, req, res, TranscriptionsFireBase);

//     // The path to the remote LINEAR16 file, must be .wav file;
//   } catch (error) {
//     console.log('Transcription process failed.');
//     res.status(500).json({ msg: 'Transcription process failed.', error: error });
//   }
// });

// module.exports = router;
