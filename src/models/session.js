const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Session extends Model { }

Session.init({
  id: {
    type: DataTypes.CHAR(12),
    primaryKey: true,
    autoIncrement: false
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expires: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'session'
})

module.exports = Session