/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transcriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Doctors', // This references the Admins table
          key: 'id',
          as: 'doctor_id',
        },
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Patients', // This references the Admins table
          key: 'id',
          as: 'patient_id',
        },
      },
      firebase_key: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transcriptions');
  },
};
