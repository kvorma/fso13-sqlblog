const router = require('express').Router()
const { Op } = require('sequelize')
const { tokenExtractor } = require('../util/middleware')
const { Blog, User } = require('../models')

const BlogView = {
  attributes: { exclude: ['userId'] },
  include: {
    model: User,
    attributes: ['realname']
  }
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll(BlogView)
  res.json(blogs)
})

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

const blogFinder = async (req, res, next) => {
  req.blogEntry = await Blog.findByPk(req.params.id)
  next()
}

router.delete('/:id', async (req, res) => {
  const gone = await Blog.destroy({
    where: {
      id: {
        [Op.eq]: Number(req.params.id),
      },
    },
  });
  if (gone) {
    res.json(gone)
  } else {
    res.status(404).end()
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  if (req.blogEntry) {
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
  } else {
    res.status(404).end()
  }
})

module.exports = router