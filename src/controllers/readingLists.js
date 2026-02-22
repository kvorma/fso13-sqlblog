const router = require('express').Router()
const { ReadingList } = require('../models')
//const logger = require('../util/logger')
const { tokenExtractor } = require('../util/middleware')

//  Add to Reading list 13.20 (logged in)

router.post('/', tokenExtractor, async (req, res, next) => {
  const bid = req?.body?.blog_id
  const uid = req?.body?.user_id

  if (!bid || !uid) {
    return res.status(400).end()
  }
  try {
    const resp = await ReadingList.create({
      userId: uid,
      blogId: bid,
      read: false
    })
    res.json(resp)
  } catch (e) {
    next(e)
  }
})


module.exports = router