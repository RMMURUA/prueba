const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
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
    }
  }
  Subscription.init({
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    premium: DataTypes.BOOLEAN,
    token: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    doctor_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};
