const router = require('express').Router()
const { User, Blog, Reading } = require('../models')
const { TEST } = require('../util/config')
const { tokenExtractor, mockExtractor, blogFinder } = require('../util/middleware')

const Returning = ['blog_id', 'user_id', 'read', 'id']

//  Add to Reading list 13.20 (logged in)

router.post('/', TEST ? mockExtractor : tokenExtractor, async (req, res, next) => {
  const bid = Number(req?.body?.blogId)
  const uid = Number(req?.body?.userId)

  if (!bid || !uid) {
    return res.status(400).end()
  }
  try {
    const resp = await Reading.create({
      userId: uid,
      blogId: bid,
      read: false
    }, { returning: Returning })
    console.log(resp)
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
    const rl = await Reading.findByPk(bid)
    if (!rl) return res.status(404).end()
    if (rl.userId !== uid) return res.status(401).end()

    const newState = req?.body?.read
    if (typeof newState !== 'boolean') return res.status(400).end()

    const [rows] = await Reading.update({
      read: newState
    }, {
      where: { id: rl.id }
    })
    if (rows === 1) {
      res.json({ read: newState })
    } else {
      res.status(500).end()
    }
  } catch (e) {
    next(e)
  }
})

// Get All (anyone)

router.get('/', async (request, response) => {
  const reads = await Reading.findAll({
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