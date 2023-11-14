const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Transcription, {
        foreignKey: 'patient_id',
      });
    }
  }
  Patient.init({
    birth_date: DataTypes.DATE,
    dni: {
      type: DataTypes.STRING,
      unique: {
        arg: true,
        msg: 'This patient already exists.',
      },
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    name: DataTypes.STRING,
    last_name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};
