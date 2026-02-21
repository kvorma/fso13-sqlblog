const { DATABASE_URL } = require('./src/util/config')
const { Blog } = require('./src/models')
const newblogs = require('./data/blogs.json')

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(DATABASE_URL, { logging: false, })

const fields = ['author', 'url', 'title', 'likes', 'userId']

const main = async () => {
  try {
    await sequelize.authenticate()
    console.log('bulk loading blogs to', DATABASE_URL)
    await Blog.bulkCreate(newblogs, { fields })
    await sequelize.close()
    process.exit(0)
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

main()