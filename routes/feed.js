const express = require('express')
const isAuth = require('../middleware/isAuth')
const { body } = require('express-validator')
const feedsController = require('../controllers/feed')
const router = express.Router()

router.get('/status', isAuth, feedsController.getStatus)
router.post('/status', isAuth, feedsController.postStatus)
// GET /feeds/posts
router.get('/posts', isAuth, feedsController.getPosts)
router.post('/post', isAuth, [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedsController.createPost)

router.put('/post/:postId', isAuth, [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
], feedsController.updatePost)

router.get('/post/:postId', isAuth, feedsController.getPost)

router.delete('/post/:postId', isAuth, feedsController.deletePost)

module.exports = router
