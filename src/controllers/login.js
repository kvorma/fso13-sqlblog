const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')
const logger = require('../util/logger')
const { SECRET } = require('../util/config')

router.post('/', async (request, response, next) => {
  const { username, password } = request.body
  let user
  console.log('LOGIN:', username, password)
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

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET)

  logger.debug('Login - new token:', userForToken, token)

  response
    .status(200)
    .send({ token, username: user.username, realname: user.realname })
})

module.exports = router
