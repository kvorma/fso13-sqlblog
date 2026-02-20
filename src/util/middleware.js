// FullStackOpen - harjoitustyö
// middlewarea diagnostiikkaan, virheiden käsittelyyn jne
// (c) 2025 Kai Vorma

const jwt = require('jsonwebtoken')
const logger = require('./logger')
const { SECRET } = require('./config')

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
    case 'SequelizeValidationError': {
      return response.status(400)
        .json(error.errors.map(e => ({ message: e.message, type: e.type })))
    }
    case 'SequelizeDatabaseError':
    case 'SequelizeUniqueConstraintError':
      error.message += ': field must be unique'
    // eslint-disable-next-line no-fallthrough
    case 'SequelizeConnectionError': {
      return response.status(400).json({ error: error.message })
    }
    case 'JsonWebTokenError': {
      return response.status(401).json({ error: 'Authorization token missing or invalid' })
    }
  }
  next(error)
}
/*
const userExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  logger.debug2('userExtractor:', authorization)

  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')

    const decodedToken = jwt.verify(request.token, SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    logger.debug2('UserExtractor:', decodedToken)
    request.username = decodedToken.username
  } else {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  next()
}
*/
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  logger.debug2('tokenExtractor:', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
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
  tokenExtractor
}
