const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class User extends Model { }

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  realname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pwHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'user'
})

module.exports = User