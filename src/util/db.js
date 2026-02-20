const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')
const logger = require('./logger')

const db = DATABASE_URL.split('@')[1]
const sequelize = new Sequelize(DATABASE_URL)

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    logger.info(`database ${db} connected`)
  } catch (err) {
    console.log('connecting database failed:', err.message)
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }
