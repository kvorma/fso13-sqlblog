const express = require('express')
const middleware = require('./util/middleware')

const app = express()

const { PORT, TEST } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')
const authorsRouter = require('./controllers/authors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const readingsRouter = require('./controllers/readings')

app.use(express.json())
app.use(middleware.requestLogger)

if (TEST) {
  const testRouter = require('./controllers/test')
  app.use('/api/reset', testRouter)
  app.get('/', async (_req, res) => { res.send('ok') })
}

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/readinglists', readingsRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = start