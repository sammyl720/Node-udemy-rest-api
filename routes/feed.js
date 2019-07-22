const express = require('express')

const { body } = require('express-validator')
const feedsController = require('../controllers/feed')
const router = express.Router()

// GET /feeds/posts
router.get('/posts', feedsController.getPosts)
router.post('/post', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedsController.createPost)


router.put('/post/:postId',  [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedsController.updatePost)

router.get('/post/:postId', feedsController.getPost)

router.delete('/post/:postId', feedsController.deletePost)

module.exports = router
