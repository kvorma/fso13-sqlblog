// FullStackOpen - harjoitustyö
// Rutiinit diagnostiikan tulostamiseen
// (c) 2025 Kai Vorma

const config = require('./config')

const info = (...params) => {
  if (!config.QUIET) console.log('I:', ...params)
}
const debug = (...params) => {
  if (config.DEBUG_LEVEL >= 1) console.log('D1:', ...params)
}
const debug2 = (...params) => {
  if (config.DEBUG_LEVEL >= 2) console.log('D2:', ...params)
}

const error = (...params) => {
  console.error('E:', ...params)
}

module.exports = { info, debug, debug2, error }
