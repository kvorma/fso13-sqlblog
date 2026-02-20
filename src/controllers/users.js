const bcrypt = require('bcrypt')
const router = require('express').Router()
//const { Op } = require('sequelize')
const { User, Blog } = require('../models')
const logger = require('../util/logger')
const { tokenExtractor } = require('../util/middleware')

const Returning = ['username', 'realname', 'id']
const UserView = {
  attributes: { exclude: ['pwHash'] },
  include: {
    model: Blog,
    attributes: { exclude: ['userId'] }
  }
}

// Get All (anyone)

router.get('/', async (request, response) => {
  const users = await User.findAll(UserView)
  response.json(users)
})

// Add new user (logged in)

router.post('/', tokenExtractor, async (request, response, next) => {
  const { username, realname, password } = request.body
  const saltRounds = 10
  const pwHash = await bcrypt.hash(password, saltRounds)
  const newUser = {
    username,
    realname,
    pwHash
  }
  logger.debug('Adding new user:', newUser)
  try {
    const savedUser = await User.create(newUser, { returning: Returning })

    response.status(201).json({
      id: savedUser.id,
    })
  } catch (e) {
    next(e)
  }
})

// get single user (anyone)

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, UserView)
    if (user) {
      res.json(user)
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
})

// Change username (logged in)

router.put('/:username', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });
    logger.debug('PUT:user:', req.params.username, req.body)
    if (user && req.body?.realname) {
      const [rows] = await User.update({
        realname: req.body.realname
      }, {
        where: { id: user.id }
      })
      if (rows === 1) {
        logger.info('Changed name:', user.realname, ' to ', req.body.realname)
        res.json({ changed: rows })
      } else {
        logger.error('Name change failed, rows =', rows)
        res.status(500).end()
      }
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
})

module.exports = router
