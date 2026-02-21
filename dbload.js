const { DATABASE_URL } = require('./src/util/config')
const { Blog, User } = require('./src/models')

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(DATABASE_URL, { logging: false, })

const fields = ['author', 'url', 'title', 'likes', 'userId', 'createdAt', 'updatedAt']

const addDate = (list) => {
  const now = new Date()
  return list.map(i => ({ ...i, createdAt: now, updatedAt: now }))
}

const newblogs = addDate(require('./data/blogs.json'))
const newusers = addDate(require('./data/users.json'))

console.log(newblogs)
console.log(newusers)

const main = async () => {
  try {
    await sequelize.authenticate()
    console.log('bulk loading data to', DATABASE_URL)
    await User.bulkCreate(newusers)
    await Blog.bulkCreate(newblogs)
    await sequelize.close()
    process.exit(0)
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

main()