// ACA
const express = require('express');
const firebaseAdmin = require('firebase-admin');

const router = express.Router();
const { checkIfLoggedIn } = require('./middleware');

// We import firebase
function getTranscriptionFireBase() {
  const db = firebaseAdmin.firestore();
  const TranscriptionsFireBase = db.collection('Transcription');
  return TranscriptionsFireBase;
}

const updateTranscriptionInFirebase = async (transcriptionId, updatedData) => {
  try {
    const TranscriptionsFireBase = getTranscriptionFireBase();
    const transcriptionRef = TranscriptionsFireBase.doc(transcriptionId);
    await transcriptionRef.update(updatedData);
    return true;
  } catch (error) {
    console.error('Error updating transcription: ', error);
    return false;
  }
};

const deleteTranscriptionInFirebase = async (transcriptionId) => {
  try {
    const TranscriptionsFireBase = getTranscriptionFireBase();
    const transcriptionRef = TranscriptionsFireBase.doc(transcriptionId);
    await transcriptionRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting transcription: ', error);
    return false;
  }
};

module.exports = { deleteTranscriptionInFirebase };

// Only for test seed
// Firebase key: '1', '2', '3',
// '4', 'L2rEYHqgTpDBPhoutIiE', IxJwkpTyJwyE6X73pfOI, L2rEYHqgTpDBPhoutIiE

// in NoSQL
router.get('/seed', async (request, response) => {
  try {
    const data1 = {
        consultation_date: new Date('2023-08-26'),
        pacient_name: "Jorge",
        pacient_lastname: "Guzman",
        pacient_birth_date: new Date('2001-09-26'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data2 = {
        consultation_date: new Date('2023-02-02'),
        pacient_name: "Sebastian",
        pacient_lastname: "Miranda",
        pacient_birth_date: new Date('1990-02-02'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data3 = {
        consultation_date: new Date('2023-04-24'),
        pacient_name: "Raimundo",
        pacient_lastname: "Murua",
        pacient_birth_date: new Date('2000-04-24'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data4 = {
        consultation_date: new Date('2022-12-24'),
        pacient_name: "Martin",
        pacient_lastname: "Jaramillo",
        pacient_birth_date: new Date('1994-12-24'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data5 = {
        consultation_date: new Date('2022-12-20'),
        pacient_name: "Juan",
        pacient_lastname: "Mata",
        pacient_birth_date: new Date('1995-12-20'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data6 = {
        consultation_date: new Date('2023-08-26'),
        pacient_name: "Luis",
        pacient_lastname: "Alvarez",
        pacient_birth_date: new Date('2001-09-26'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data7 = {
        consultation_date: new Date('2023-03-22'),
        pacient_name: "Carmen",
        pacient_lastname: "Blanco",
        pacient_birth_date: new Date('1975-03-22'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data8 = {
        consultation_date: new Date('2023-05-30'),
        pacient_name: "Gabriela",
        pacient_lastname: "Lopez",
        pacient_birth_date: new Date('1995-05-30'),
        consultation_motive: "Dolor de cabeza y nauseas. Dificultad para respirar.",
        prescribed_treatment: "Resposo por una semana. Tomar paracetamol e ibuporfeno",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Palar con tintes blancos. Pupilas bastante dilatadas",
        diagnosis: "Sinusitis",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    const data = {
        consultation_date: "Info. no disponible",
        pacient_name: "Info. no disponible",
        pacient_lastname: "Info. no disponible",
        pacient_birth_date: "Info. no disponible",
        consultation_motive: "Info. no disponible",
        prescribed_treatment: "Info. no disponible",
        requested_exams: "Info. no disponible",
        requested_derivations: "Info. no disponible",
        anamnesis: {
            personal_history: "Info. no disponible",
            family_history: "Info. no disponible"
        },
        physical_exploration: "Info. no disponible",
        diagnosis: "Info. no disponible",
        consultation_summary: "Info. no disponible",
        ai_medical_evaluation: {
            probability_of_diagnosis_error: "Info. no disponible",
            alternative_diagnosis: "Info. no disponible",
            alternative_exams_or_speciality: "Info. no disponible"
        },
        ai_human_evaluation: {
            physician_empathy: "Info. no disponible",
            pacient_empathy: "Info. no disponible",
            pacient_experience: "Info. no disponible"
        }
    };

    // Add a new document in collection "cities" with ID 'LA'
    let res;
    res = await TranscriptionsFireBase.doc('1').set(data1);
    res = await TranscriptionsFireBase.doc('2').set(data2);
    res = await TranscriptionsFireBase.doc('3').set(data3);
    res = await TranscriptionsFireBase.doc('4').set(data4);
    res = await TranscriptionsFireBase.doc('5').set(data5);
    res = await TranscriptionsFireBase.doc('6').set(data6);
    res = await TranscriptionsFireBase.doc('7').set(data7);
    res = await TranscriptionsFireBase.doc('8').set(data8);
    res = await TranscriptionsFireBase.doc('9').set(data);
    res = await TranscriptionsFireBase.doc('10').set(data);
    res = await TranscriptionsFireBase.doc('11').set(data);
    res = await TranscriptionsFireBase.doc('12').set(data);
    res = await TranscriptionsFireBase.doc('13').set(data);
    res = await TranscriptionsFireBase.doc('14').set(data);
    res = await TranscriptionsFireBase.doc('15').set(data);
    res = await TranscriptionsFireBase.doc('16').set(data);
    res = await TranscriptionsFireBase.doc('17').set(data);
    res = await TranscriptionsFireBase.doc('18').set(data);

    response.status(200).send({msg: "Data saved", data: data});
    return;

    // Este codigo es similar al que existe en save_transcript
    const TranscriptionsFireBase = getTranscriptionFireBase();
    const firebase_transcription_success = await TranscriptionsFireBase.add(data);
    if (!firebase_transcription_success) {
      throw new Error('The Transcription was not saved at Firebase correctly.');
    }
    console.log(firebase_transcription_success.id);

    // Once a success, we have to add it to the sql transcription representation
    const sql_transcription_success = await request.orm.Transcription.create({
      doctor_id: 1,
      patient_id: 1,
      firebase_key: firebase_transcription_success.id,
    });

    if (!sql_transcription_success) {
      throw new Error('The Transcription was not saved at Postgress correctly.');
    }
    response.status(200).send({ msg: 'Data saved', data });
  } catch (error) {
    response.status(400).send({ msg: 'Error: Could not save data.', error: `${error}` });
  }
});

router.get('/view/:dni', async (request, response) => {
// router.get('/view/:dni', checkIfLoggedIn, async (request, response) => {
  try {
    const doctor_dni = request.params.dni;
    const doctor = await request.orm.Doctor.findOne({
      where: { dni: doctor_dni }, // dni: doctor_dni
      include: [{
        model: request.orm.Transcription,
        include: {
          model: await request.orm.Patient,
        },
      },
        // , attributes: ["firebase_key"]}
      ],
    });
    if (!doctor) {
      throw new Error('The Doctor does not exist.');
    }

    const transcriptions = doctor.Transcriptions;

    const TranscriptionsFireBase = getTranscriptionFireBase();

    // Fetch each transcription's data from Firebase using firebase_key
    const transcriptionsData = await Promise.all(
      transcriptions.map(async (result) => {
        // const numberKey = result.firebase_key;
        const transcription = TranscriptionsFireBase.doc(result.firebase_key);
        const transcription_data = await transcription.get();

        if (!transcription_data.exists) {
          console.log(`No Transcription has been found with key: ${result.firebase_key}`);
          return null;
        }
        console.log(result);
        return { transcription_id: result.firebase_key, transcription_data: transcription_data.data(), patient_data: result.Patient };
      }),
    );

    response.status(200).send({ msg: 'Doctor found', transcriptions: transcriptionsData });
  } catch (error) {
    response.status(400).send({ msg: 'Error: Patient not found.', error: `${error}` });
  }
});

router.get('/view/transcription/:transcription_id', async (request, response) => {
  try {
    const { transcription_id } = request.params;

    const this_transcription = await request.orm.Transcription.findOne({
      where: { firebase_key: transcription_id },
      include: [{
        model: request.orm.Patient,
      }],
    });

    const patient = this_transcription.Patient;

    const TranscriptionsFireBase = getTranscriptionFireBase();

    // const numberKey = result.firebase_key;
    const transcription = TranscriptionsFireBase.doc(transcription_id);
    const transcription_data = await transcription.get();

    if (!transcription_data.exists) {
      console.log(`No Transcription has been found with key: ${transcription_id}`);
      response.status(400).send({ msg: 'Error: Transcription not found.' });
    }
    response.status(200).send({
      msg: 'Transcription Found', transcription_id, transcription_data: transcription_data.data(), patient_data: patient,
    });
  } catch (error) {
    response.status(400).send({ msg: 'Error: Transcription not found.', error: `${error}` });
  }
});

router.put('/update/transcription/:transcription_id', async (request, response) => {
  try {
    const { transcription_id } = request.params;
    const updatedData = request.body; // assuming that the updated data is sent in the request body

    // Validate the updated data if necessary
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return response.status(400).send({ msg: 'Error: No data provided for update.' });
    }

    // Update the data in Firebase
    const updateResult = await updateTranscriptionInFirebase(transcription_id, updatedData);

    if (updateResult) {
      return response.status(200).send({ msg: 'Transcription successfully updated', updatedData });
    }
    return response.status(400).send({ msg: 'Error: Failed to update Transcription.' });
  } catch (error) {
    return response.status(400).send({ msg: 'Error: Failed to update Transcription.', error: `${error}` });
  }
});

router.delete('/delete/transcription/:transcription_id', async (request, response) => {
  try {
    const { transcription_id } = request.params;

    // Delete the data in Firebase
    const deleteResult = await deleteTranscriptionInFirebase(transcription_id);

    const transcription = await request.orm.Transcription.findOne({
      where: { firebase_key: transcription_id },
    });

    if (!transcription) {
      return response.status(404).send({ msg: 'Error: Transcription not found in the relational database.' });
    }

    await transcription.destroy();

    if (deleteResult) {
      return response.status(200).send({ msg: 'Transcription successfully deleted' });
    }
    return response.status(400).send({ msg: 'Error: Failed to delete Transcription.' });
  } catch (error) {
    return response.status(400).send({ msg: 'Error: Failed to delete Transcription.', error: `${error}` });
  }
});

module.exports = router;
