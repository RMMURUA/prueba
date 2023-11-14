const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Association with Admin through UserPermission
      this.belongsToMany(models.Admin, {
        through: models.AdminPermission,
        foreignKey: 'permission_id', // Foreign key for Permission in UserPermission
      });

      // Association with Doctor through UserPermission
      this.belongsToMany(models.Doctor, {
        through: models.DoctorPermission,
        foreignKey: 'permission_id', // Foreign key for Permission in UserPermission
      });
      // Careful with both above: Might have to solve this later, it doesn't look nice.
    }
  }
  Permission.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Permission',
  });
  return Permission;
};
