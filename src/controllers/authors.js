/* eslint-disable no-unused-vars */
const router = require('express').Router()
const Sequelize = require('sequelize')
const { Blog } = require('../models')
const logger = require('../util/logger')

//  Author summary 13.16 (anyone)

router.get('/', async (req, res, next) => {
  const selectFrom = [
    'author',
    [Sequelize.fn('COUNT', Sequelize.col('id')), 'blogs'],
    [Sequelize.fn('SUM', Sequelize.col('likes')), 'likes'],
  ]
  const groupBy = 'author'
  const sortBy = [['likes', 'DESC']]
  const query = {
    attributes: selectFrom,
    group: groupBy,
    order: sortBy
  }
  console.log('Query:', query)
  try {
    const blogs = await Blog.findAll(query)
    res.json(blogs)
  } catch (e) {
    next(e)
  }
})


module.exports = router