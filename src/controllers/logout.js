const router = require('express').Router()
const { Session } = require('../models')
const logger = require('../util/logger')
const { tokenExtractor } = require('../util/middleware')

// Logout / delete session

router.delete('/', tokenExtractor, async (req, res) => {
  const uid = req.decodedToken.id
  const uuid = req.decodedToken.sessionId

  try {
    await Session.update({
      isValid: false
    }, {
      where: { user_id: uid }
    })
    res.status(204).end()
  } catch (e) {
    logger.error('Disabling session failed:', uuid, e.message)
    res.status(500).end()
  }
})

module.exports = router
