const express = require('express')

const { body } = require('express-validator/check')
const feedsController = require('../controllers/feed')
const router = express.Router()

// GET /feeds/posts
router.get('/posts', feedsController.getPosts)
router.post('/post', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedsController.createPost)

router.get('/post/:postId', feedsController.getPost)

module.exports = router
