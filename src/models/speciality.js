const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Speciality extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Doctor, {
        through: models.DoctorSpeciality, // Intermediate table.
        foreignKey: 'speciality_id', // Foreign key of said table that Admin uses.
      });
    }
  }
  Speciality.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Speciality',
  });
  return Speciality;
};
