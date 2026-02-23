const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User, Session } = require('../models')
const logger = require('../util/logger')
const { SECRET, TOKEN_LIFETIME } = require('../util/config')
const { getNewId } = require('../util/auth')
const { tokenExtractor, mockExtractor } = require('../util/middleware')

router.post('/', async (request, response, next) => {
  const { username, password } = request.body
  let user
  try {
    user = await User.findOne({
      where: {
        username: username
      }
    })
  } catch (e) {
    next(e)
    return
  }
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.pwHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.disabled) {
    return response.status(403).json({
      error: 'account closed - please contact helpdesk'
    })
  }

  const expires = Math.floor(new Date().getTime() / 1000) + Number(TOKEN_LIFETIME)
  const userForToken = {
    sessionId: getNewId(),
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET, { expiresIn: TOKEN_LIFETIME })

  try {
    await Session.create({
      id: userForToken.sessionId,
      isValid: true,
      expires: expires,
      userId: user.id
    })
    logger.debug('Login - new token:', userForToken, token)
    response
      .status(200)
      .send({ token, username: user.username, name: user.name })
  } catch (e) {
    console.error('Create session failed:', e.message)
    response.status(500).json({
      error: 'Cannot create session'
    })
  }
})

// Logout / delete session

router.delete('/:id', tokenExtractor, async (req, res) => {
  const uid = req.decodedToken.id
  const uuid = req.decodedToken.sessionId

  if (uid !== Number(req.params.id)) {
    return res.status(403).end()
  }
  try {
    await Session.update({
      isValid: false
    }, {
      where: { id: uuid }
    })
    res.status(200).end()
  } catch (e) {
    logger.error('Disabling session failed:', uuid, e.message)
    res.status(500).end()
  }
})

module.exports = router
