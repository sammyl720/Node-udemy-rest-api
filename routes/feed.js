const express = require("express");

const feedsController = require("../controllers/feed")
const router = express.Router();

// GET /feeds/posts
router.get("/posts", feedsController.getPosts);
router.post("/post", feedsController.createPost);

module.exports = router;