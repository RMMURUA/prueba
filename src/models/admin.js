const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Permission, {
        through: models.AdminPermission, // Intermediate table.
        foreignKey: 'admin_id', // Foreign key of said table that User uses.
      });
    }
  }
  Admin.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    dni: {
      type: DataTypes.STRING,
      unique: {
        arg: true,
        msg: 'This Administrator already exists.',
      },
    },
    uid_firebase: {
      type: DataTypes.STRING,
      unique: {
        arg: true,
        msg: 'This Firebase representation of the Administrator already exists.',
      },
    },
  }, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};
