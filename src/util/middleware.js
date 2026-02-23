// FullStackOpen - harjoitustyö
// middlewarea diagnostiikkaan, virheiden käsittelyyn jne
// (c) 2025 Kai Vorma

const jwt = require('jsonwebtoken')
const logger = require('./logger')
const { SECRET } = require('./config')
const { Blog, Session } = require('../models')

const requestLogger = (request, response, next) => {
  logger.debug('Method:', request.method)
  logger.debug('Path:  ', request.path)
  logger.debug('Body:  ', request.body)
  logger.debug('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.debug('errorHandler:', error.name, ' : ', error.message)
  switch (error.name) {
    case 'SequelizeForeignKeyConstraintError':
      return response.status(404).json({ error: error.message })
    case 'SequelizeValidationError': {
      return response.status(400)
        .json(error.errors.map(e => ({ message: e.message, type: e.type })))
    }
    case 'SequelizeUniqueConstraintError': {
      error.message += ': field must be unique'
      return response.status(400).json({ error: error.message })
    }
    case 'SequelizeDatabaseError':
    case 'SequelizeConnectionError': {
      return response.status(400).json({ error: error.message })
    }
    case 'JsonWebTokenError': {
      return response.status(401).json({ error: 'Authorization token missing or invalid' })
    }
  }
  next(error)
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

const mockExtractor = (req, res, next) => { next() }

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  logger.debug2('tokenExtractor:', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      const s = await Session.findByPk(req.decodedToken.sessionId)
      if (!s?.isValid) {
        throw new Error()
      }
    } catch (e) {
      logger.error(e)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  logger.debug2('tokenExtractor: passed')
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  blogFinder,
  tokenExtractor,
  mockExtractor,
}
