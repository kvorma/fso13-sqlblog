const router = require('express').Router()
const { sequelize } = require('../util/db')
const logger = require('../util/logger')

// clear database, testing only

const tables = ['sessions', 'readings', 'blogs', 'users']

router.post('/', async (req, res) => {
  for (let t of tables) {
    logger.debug('Emptying table', t)
    await sequelize.query(`DELETE FROM ${t}`)
  }
  res.status(200).end()
})


module.exports = router