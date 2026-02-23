const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('users', 'disabled', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    })
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.CHAR(12),
        primaryKey: true,
        autoIncrement: false
      },
      is_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      expires: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'disabled')
    await queryInterface.dropTable('sessions')
  },
}