const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Permission, {
        through: models.DoctorPermission, // Intermediate table.
        foreignKey: 'doctor_id', // Foreign key of said table that User uses.
      });

      this.hasOne(models.Subscription, {
        foreignKey: 'doctor_id',
      });

      this.belongsToMany(models.Speciality, {
        through: models.DoctorSpeciality, // Intermediate table.
        foreignKey: 'doctor_id', // Foreign key of said table that Doctor uses.
      });

      this.hasMany(models.Transcription, {
        foreignKey: 'doctor_id',
      });
    }
  }
  Doctor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    dni: {
      type: DataTypes.STRING,
      unique: {
        arg: true,
        msg: 'This Doctor already exists.',
      },
    },
    uid_firebase: {
      type: DataTypes.STRING,
      unique: {
        arg: true,
        msg: 'This Firebase representation of the Doctor already exists.',
      },
    },
  }, {
    sequelize,
    modelName: 'Doctor',
  });
  return Doctor;
};
