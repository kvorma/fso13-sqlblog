

const getNewId = () => {
  return crypto.randomUUID().slice(-12)
}

module.exports = {
  getNewId,
}