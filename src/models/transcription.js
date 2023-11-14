const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transcription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Doctor, {
        foreignKey: 'doctor_id',
      });
      this.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
      });
    }
  }
  Transcription.init({
    doctor_id: DataTypes.INTEGER,
    patient_id: DataTypes.INTEGER,
    firebase_key: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Transcription',
  });
  return Transcription;
};
