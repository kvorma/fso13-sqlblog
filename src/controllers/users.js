const bcrypt = require('bcrypt')
const router = require('express').Router()
const { Op } = require('sequelize')
const { User, Blog, ReadingList } = require('../models')
const logger = require('../util/logger')
const { tokenExtractor, mockExtractor } = require('../util/middleware')
const { TEST } = require('../util/config')

const Returning = ['username', 'name', 'id']
const where = { read: { [Op.in]: [true, false] } }
const UserView = {
  attributes: { exclude: ['pwHash', 'createdAt', 'updatedAt'] },
  include: [{
    model: ReadingList,
    attributes: ['read'],
    include: {
      model: Blog,
      attributes: { exclude: ['userId', 'blogId', 'createdAt', 'updatedAt'] },
    },
    where
  }]
}
const UserList = {
  attributes: { exclude: ['pwHash', 'createdAt', 'updatedAt'] },
  include: {
    model: Blog,
    attributes: { exclude: ['userId', 'blogId', 'createdAt', 'updatedAt'] },
  }
}


// Get All (anyone)

router.get('/', async (req, res) => {
  switch (req?.query?.read) {
    case 'true':
      where.read = true
      break
    case 'false':
      where.read = false
      break
  }
  const users = await User.findAll(UserList)
  res.json(users)
})

// Add new user (logged in)

router.post('/', TEST ? mockExtractor : tokenExtractor, async (req, res, next) => {
  const { username, name, password } = req.body
  const saltRounds = 10
  const pwHash = await bcrypt.hash(password, saltRounds)
  const newUser = {
    username,
    name,
    pwHash,
    disabled: false
  }
  logger.debug('Adding new user:', newUser)
  try {
    const savedUser = await User.create(newUser, { returning: Returning })

    res.status(201).json({
      id: savedUser.id,
    })
  } catch (e) {
    next(e)
  }
})

// get single user (anyone)

router.get('/:id', async (req, res, next) => {
  try {
    const uid = Number(req.params.id)
    switch (req?.query?.read) {
      case 'true':
        where.read = true
        break
      case 'false':
        where.read = false
        break
    }
    let user = await User.findByPk(uid, UserView)
    if (user === null) {
      user = await User.findByPk(uid, UserList)
    }
    if (user) {
      res.json({ user })
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
    if (user && req.body?.name) {
      const [rows] = await User.update({
        name: req.body.name
      }, {
        where: { id: user.id }
      })
      if (rows === 1) {
        logger.info('Changed name:', user.name, ' to ', req.body.name)
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
