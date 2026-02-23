const Blog = require('./blog')
const User = require('./user')
const Reading = require('./reading')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)
User.belongsToMany(Blog, { through: Reading })
Blog.belongsToMany(User, { through: Reading })
User.hasMany(Reading)
Reading.belongsTo(User)
Blog.hasMany(Reading)
Reading.belongsTo(Blog)

User.hasMany(Session)
Session.belongsTo(User)


module.exports = {
  Blog,
  User,
  Reading,
  Session
}