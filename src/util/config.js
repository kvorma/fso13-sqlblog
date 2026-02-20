require('@dotenvx/dotenvx').config({ quiet: true })

const dx = require('@dotenvx/dotenvx')
const test = process.env.NODE_ENV === 'test'
const dev = process.env.NODE_ENV === 'development'
const db = test ? 'blog_test' : 'blog_db'

if (process.env.GITHUB_ACTIONS) {
  dx.config({ path: '.env.github', quiet: true })
} else if (dev || test) {
  dx.config({ path: '.env.dev', quiet: true })
} else {
  dx.config({ path: '.env', quiet: true })
}

const PORT = test ? process.env.PORT_TEST : process.env.PORT
const DATABASE_URL = `${process.env.DATABASE_URL}/${db}`
const DEBUG_LEVEL = process.env.DEBUG_OVERRIDE || (test ? 0 : process.env.DEBUG_LEVEL) || 0
const QUIET = (test ? true : process.env.QUIET) || false
const SECRET = process.env.SECRET

if (DEBUG_LEVEL > 0) {
  console.log('Config loaded:', { NODE_ENV: process.env.NODE_ENV, test, DATABASE_URL, PORT, DEBUG_LEVEL, QUIET })
}
if (!PORT || !SECRET) {
  console.error('Error: Missing required environment variables. Please check your .env file.')
  process.exit(1)
}
module.exports = {
  DATABASE_URL,
  PORT,
  DEBUG_LEVEL,
  QUIET,
  SECRET
}
