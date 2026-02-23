const dx = require('@dotenvx/dotenvx')
const test = process.env.NODE_ENV === 'test'
const dev = process.env.NODE_ENV === 'development'
const db = test ? 'blog_test' : 'blog_db'
if (process.env.GITHUB_ACTIONS) {
  dx.config({ path: '.env.github', quiet: true })
} else if (dev || test) {
  dx.config({ path: '.env.dev' })
} else {
  dx.config({ path: '.env' })
}

const cfg = {
  PORT: test ? (process.env.PORT_TEST || 3001) : (process.env.PORT || 3000),
  DATABASE_URL: `${process.env.DATABASE_URL}/${db}`,
  DEBUG_LEVEL: process.env.DEBUG_OVERRIDE || (test ? 0 : process.env.DEBUG_LEVEL) || 0,
  QUIET: (test ? true : process.env.QUIET) || false,
  SECRET: process.env.SECRET,
  TOKEN_LIFETIME: Number(process.env.TOKEN_LIFETIME || 86400),
  TEST: test
}

if (cfg.DEBUG_LEVEL > 0) {
  console.log('Config loaded:', { NODE_ENV: process.env.NODE_ENV, ...cfg })
}
if (!cfg.SECRET) {
  console.error('Error: Missing required environment variables. Please check your .env file.')
  process.exit(1)
}
// process.exit(0)
module.exports = cfg
