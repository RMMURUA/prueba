const express = require('express');

const router = express.Router();
// We'll create the patients as we do with any other "user" but in this scenario, the
// patient is not a real user, it's model just happens to look like one, thus, you'll have less
// logic to worry about...
const { checkIfLoggedIn, checkIfDoctor } = require("./middleware.js");

function getcreateUserFirebaseAuth(){
    const auth = firebaseAdmin.auth();
    //const createUserFirebaseAuth = auth.createUser();
    return auth;
}

router.post("/create", checkIfLoggedIn, checkIfDoctor, async(request, response) => {
    // THIS DOES REQUIRE A JWT
    // YOU ALSO NEED TO BE AUTHORIZED
    try {
        const data = await request.body;
        const name = data.name;
        const last_name = data.last_name;
        const dni = data.dni;
        const email = data.email;
        const phone = data.phone;
        const birth_date = data.birth_date;

        // We check if the patient is not already in the database.
        if (dni){
            const patient = await request.orm.Patient.findOne({where: {dni: dni}});
            if (patient){
                throw new Error(`The DNI: '${dni}' is already un use`);
            }            
        } else {
            throw new Error("The Patient must have a DNI associated.");
        }

        // We check for basic format
        if (name.length < 3 || name.length > 30) {
            throw new Error('The name must be at least 3 characters and 30 at most.');
        }
        if (last_name.length < 3 || last_name.length > 30){
            throw new Error('The Last name must be at least 3 characters and 30 at most.');
        }
        if (dni.length < 9 || dni.length > 10) {
            throw new Error('Dni must ve at least 9 characters and 10 at most.');
        }
        if (!dni.includes('-') || dni[dni.length - 1] === '-' ){
            throw new Error('Dni has to include "-" and the last digit');
        }

        if (!email.includes('@')){
            throw new Error('Email format is incorrect.');
        }
        if (!phone){
            throw new Error('Must provide a phone number for contact.')
        }
        if (!birth_date){
            throw new Error('Must provide birth date.');
        }

        const created_patient = await request.orm.Patient.create({
            birth_date: birth_date,
            dni: dni,
            email: email,
            phone: phone,
            name: name,
            last_name: last_name
        });

        if (created_patient){
            response.status(200).send({msg: "User added successfully!", patient: created_patient});
        } else {
            throw new Error('Error while creating Patient in the Postgress model.');
        }

    } catch (error) {
        response.status(400).send({msg: "Error creating the Patient. Client's side.", error: `${error}`});
    }
});

router.get("/find/:parameter", checkIfLoggedIn, checkIfDoctor, async(request, response) => {
    // THIS DOES REQUIRE A JWT
    // YOU ALSO NEED TO BE AUTHORIZED
    const parameter = request.params.parameter;

    if (parameter.includes("-")){
        let regex = /^[0-9-]*$/;
        if (!regex.test(parameter)) {
            throw new Error("You've provided a Dni with '-' symbol but with letters. Are you trying to search by 'name' perhaps?", { type: 1 })
        } else if (parameter.length < 9 || parameter.length > 11 || parameter[parameter.length - 2] !== "-") {
            throw new Error('Dni has the wrong length or it does not include "-" followed by the last digit.', { type: 1 });
        }
        try {
            const patient = await request.orm.Patient.findOne({where: {dni: parameter}});
            if (patient) {
                response.status(200).send({ msg: 'User was found!', patient: patient });
            } else {
                throw new Error('Error while finding Patient in the Postgress model.', { type : 2 });
            }
        } catch (error) {
            if (error === 1) {
                response.status(400).send({ msg: "Error finding the Patient. Client's side.", error: `${error}` });
            } else {
                response.status(500).send({ msg: "Error finding the Patient. Server's side.", error: `${error}` });
            }
        }

    } else {
        let regex = /^[a-zA-Z\s]+$/;
        if (regex.test(parameter)){
            try {
                if (parameter.length < 3 || parameter.length > 30) {
                    throw new Error('Please, use Name and Last Name.', { type: 1 });
                }
                const patient = await request.orm.Patient.findOne({where: {name: parameter}});
                if (patient) {
                    response.status(200).send({ msg: 'User was found!', patient: patient });
                } else {
                    throw new Error('Error while finding Patient in the Postgress model.', { type : 2});
                }
            } catch (error) {
                if (error.type === 1){
                    response.status(400).send({ msg: "Error finding the Patient. Client's side.", error: `${error}` });
                } else {
                    response.status(500).send({ msg: "Error finding the Patient. Server's side.", error: `${error}` });
                }
            }
        } else {
            response.status(400).send({ msg: "The given name contains numbers. Are you trying to search by Dni perhaps?. Client's side."});
        }
    }
});


router.delete("/:id", checkIfLoggedIn, checkIfDoctor, async(request, response) => {
    // THIS DOES REQUIRE A JWT
    // YOU ALSO NEED TO BE AUTHORIZED
    const patient_id = await request.params.id;
    try {
        const Patient = await request.orm.Patient.findOne({
            where: {id: patient_id}, 
        });

    await Patient.destroy();

    const destroyedPatient = await request.orm.Patient.findOne({
      where: { id: patient_id },
    });

    if (destroyedPatient) {
      throw new Error(`The Patient of id: '${patient_id}' was not deleted.`);
    }

    response.status(200).send({ msg: 'The Patient has been successfuly deleted.' });

  } catch (error) {
    response.status(400).send({ msg: 'Error while deleting Patient.', error: `${error}` });
  }
});

router.put("/", checkIfLoggedIn, checkIfDoctor, async(request, response) => {
    // THIS DOES REQUIRE A JWT
    // YOU ALSO NEED TO BE AUTHORIZED
    
    try {
        const data = await request.body;
        const id = data.id;
        const name = data.name;
        const last_name = data.last_name;
        const dni = data.dni;
        const email = data.email;
        const phone = data.phone;
        const birth_date = data.birth_date;

        // We check if the patient is not already in the database.

        if (dni)
            {
                const patient = await request.orm.Patient.findOne({where: {dni: dni}});
                if (patient && patient.id != id){
                    throw new Error(`The DNI: '${dni}' is already un use`);
                }            
            }

        // We check for basic format
        if (name.length < 3 || name.length > 30) {
            throw new Error('The name must be at least 3 characters and 30 at most.');
        }
        if (last_name.length < 3 || last_name.length > 30){
            throw new Error('The Last name must be at least 3 characters and 30 at most.');
        }
        if (dni.length < 9 || dni.length > 10) {
            throw new Error('Dni must ve at least 9 characters and 10 at most.');
        }
        if (!dni.includes('-') || dni[dni.length - 1] === '-' ){
            throw new Error('Dni has to include "-" and the last digit');
        }
        if (!email.includes('@')){
            throw new Error('Email format is incorrect.');
        }
        if (!phone){
            throw new Error('Must provide a phone number for contact.')
        }
        if (!birth_date){
            throw new Error('Must provide birth date.');
        }
        //We find if the patient to update exists

        const patient_to_update = await request.orm.Patient.findOne({where: {id: id}});
            if (!patient_to_update){
                throw new Error(`Patient with id ${id} does not exist.`)
            }
            
        const updated_patient = await patient_to_update.update({
            birth_date: birth_date,
            dni: dni,
            email: email,
            phone: phone,
            name: name,
            last_name: last_name
        });

        if (!updated_patient){
            throw new Error('Error while updating Patient in the Postgress model.');
            }

        response.status(200).send({msg: "Patient updated successfully!", patient: updated_patient});

    } catch (error) {
        response.status(400).send({msg: "Error updating the Patient.", error: `${error}`});
    }

});

module.exports = router;
