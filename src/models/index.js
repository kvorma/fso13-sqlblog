const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readinglist')

User.hasMany(Blog)
Blog.belongsTo(User)
// User.belongsToMany(Blog, { through: ReadingList })
// Blog.belongsToMany(User, { through: ReadingList })

// The Super Many-to-Many relationship
User.hasMany(ReadingList)
ReadingList.belongsTo(User)
Blog.hasMany(ReadingList)
ReadingList.belongsTo(Blog)

module.exports = {
  Blog,
  User,
  ReadingList
}