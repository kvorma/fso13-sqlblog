const bcrypt = require('bcrypt')
const router = require('express').Router()
const { Op } = require('sequelize')
const { User, Blog } = require('../models')
const logger = require('../util/logger')
const { tokenExtractor } = require('../util/middleware')

const Accepting = ['username', 'realname', 'pwHash']
const Returning = ['username', 'realname', 'id']
const UserView = {
  attributes: { exclude: ['pwHash'] },
  include: {
    model: Blog,
    attributes: { exclude: ['userId'] }
  }
}

router.get('/', async (request, response) => {
  const users = await User.findAll(UserView)
  response.json(users)
})

// accepts single user or list of users for quick db initialization.
// stops at first error in the latter case

router.post('/', async (request, response, next) => {
  const newUsers = []
  const users = Array.isArray(request.body)
    ? request.body
    : [request.body]

  for (let u of users) {
    const { username, realname, password } = u
    const saltRounds = 10
    const pwHash = await bcrypt.hash(password, saltRounds)
    newUsers.push({
      username,
      realname,
      pwHash
    })
  }
  logger.debug('Adding new users:', newUsers)
  try {
    const savedUsers = await User.bulkCreate(newUsers, { fields: Accepting, returning: Returning })
    response.status(201).json(savedUsers)
  } catch (e) {
    next(e)
  }
})

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

router.put('/:username', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: {
          [Op.eq]: req.params.username,
        },
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
