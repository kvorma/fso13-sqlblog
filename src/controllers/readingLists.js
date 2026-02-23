const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')
//const logger = require('../util/logger')
const { tokenExtractor } = require('../util/middleware')

//  Add to Reading list 13.20 (logged in)

router.post('/', tokenExtractor, async (req, res, next) => {
  const bid = Number(req?.body?.blog_id)
  const uid = Number(req?.body?.user_id)

  if (!bid || !uid) {
    return res.status(400).end()
  }
  try {
    const resp = await ReadingList.create({
      userId: uid,
      blogId: bid,
      read: false
    })
    res.json(resp)
  } catch (e) {
    next(e)
  }
})

// Set "read" status 13.22 (logged in, owner)

router.put('/:id', tokenExtractor, async (req, res, next) => {
  const bid = Number(req.params.id)
  const uid = Number(req.decodedToken.id)
  if (!bid || !uid) return res.status(400).end()

  try {
    const rl = await ReadingList.findByPk(bid)
    if (!rl) return res.status(404).end()
    if (rl.userId !== uid) return res.status(403).end()

    const newState = req?.body?.read
    if (typeof newState !== 'boolean') return res.status(400).end()

    const [rows] = await ReadingList.update({
      read: newState
    }, {
      where: { id: rl.id }
    })
    if (rows === 1) {
      res.json({ changed: rows })
    } else {
      res.status(500).end()
    }
  } catch (e) {
    next(e)
  }
})

// Get All (anyone)

router.get('/', async (request, response) => {
  const reads = await ReadingList.findAll({
    through: {
      attributes: [],
    },
    attributes: ['id', 'read'],
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'name']
      },
      {
        model: Blog,
        attributes: ['id', 'title', 'author']
      }]
  })
  response.json(reads)
})

module.exports = router