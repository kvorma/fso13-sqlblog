const router = require('express').Router()
//const qs = require('qs)')
const { Op } = require('sequelize')
const { tokenExtractor } = require('../util/middleware')
const { Blog, User } = require('../models')
const logger = require('../util/logger')

const BlogView = {
  attributes: { exclude: ['userId'] },
  include: {
    model: User,
    attributes: ['realname']
  }
}

const blogFinder = async (req, res, next) => {
  logger.debug2('blogFinder:', req.params.id)
  try {
    const blog = await Blog.findByPk(req.params.id)
    if (blog) {
      logger.debug2('blogFinder:', JSON.stringify(blog, null, 2))
      req.blogEntry = blog
      next()
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
}
//  Get All (anyone)

router.get('/', async (req, res, next) => {
  let where = {}
  const orderBy = {
    order: [['likes', 'DESC']]
  }
  const search = req?.query?.search || null
  if (search) {
    where = {
      [Op.or]: [
        { title: { [Op.substring]: search } },
        { author: { [Op.substring]: search } }
      ]
    }
  }
  try {
    const blogs = await Blog.findAll({
      ...BlogView,
      where,
      ...orderBy
    })
    res.json(blogs)
  } catch (e) {
    next(e)
  }
})

// Add new (logged in)

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({
      ...req.body,
      userId: user.id
    })
    return res.json(blog)
  } catch (error) {
    next(error)
  }
})

// Delete a blog (logged in, blogOwner)

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  if (req.blogEntry.userId != req.decodedToken.id) {
    res.status(403).end()
    return
  }
  const gone = await Blog.destroy({
    where: {
      id: Number(req.params.id),
    },
  });
  if (gone) {
    res.json({ deleted: gone })
  } else {
    res.status(404).end()
  }
})

// Update likes (anyone)

router.put('/:id', blogFinder, async (req, res, next) => {
  if (req.body.likes !== undefined) {
    req.blogEntry.likes = req.body.likes
    try {
      await req.blogEntry.save()
      res.json(req.note)
    } catch (e) {
      next(e)
    }
  } else {
    res.status(400).end()
  }
})

module.exports = router