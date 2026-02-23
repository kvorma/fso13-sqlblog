const bcrypt = require('bcrypt')
const router = require('express').Router()
const { Op } = require('sequelize')
const { User, Blog, Reading } = require('../models')
const logger = require('../util/logger')
const { tokenExtractor, mockExtractor } = require('../util/middleware')
const { TEST } = require('../util/config')

const Returning = ['username', 'name', 'id']
const UserView = {
  attributes: { exclude: ['pwHash', 'disabled', 'createdAt', 'updatedAt'] },
}
const UserList = {
  ...UserView,
  include: {
    model: Blog,
    attributes: { exclude: ['userId', 'blogId', 'createdAt', 'updatedAt'] },
  }
}

// get single user (anyone)

router.get('/:id', async (req, res, next) => {
  const uid = Number(req.params.id)
  const cond = [
    { read: { [Op.in]: [true, false] } },
    { user_id: uid }
  ]

  switch (req?.query?.read) {
    case 'true':
      cond[0].read = true
      break
    case 'false':
      cond[0].read = false
      break
  }
  try {
    const u = await User.findByPk(uid, UserView)
    if (u === null) {
      return res.status(404).end()
    }
    const json = { id: u.id, name: u.name, username: u.username }
    const rl = await Reading.findAll({
      attributes: ['read', 'id'],
      through: { attributes: [] },
      include: {
        model: Blog,
        attributes: ['id', 'title', 'author', 'url'],
      },
      where: cond
    })
    console.log('RL=', rl)
    json.readings = rl.map(r => ({
      id: r.blog.id,
      title: r.blog.title,
      author: r.blog.author,
      url: r.blog.url,
      reading_list: { read: r.read, id: r.id }
    })) || []
    res.json(json)
  } catch (e) {
    next(e)
  }
})

// Get All (anyone)

router.get('/', async (req, res) => {
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
      name: name,
      username: username
    })
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
