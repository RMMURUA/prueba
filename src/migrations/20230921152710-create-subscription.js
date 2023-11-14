/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      premium: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      token: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      doctor_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Doctors',
          key: 'id',
          as: 'doctor_id',
        },
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
    await queryInterface.dropTable('Subscriptions');
  },
};
