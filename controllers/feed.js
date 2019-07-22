const { validationResult } = require('express-validator')
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  let totalItems
  Post.find().countDocuments().then(count => {
    totalItems = count
    return Post.find().skip((currentPage - 1) * perPage).limit(perPage)
  }).then(posts => {
    res.status(200).json({ message: 'Fetched posts succesfully', posts: posts, totalItems: totalItems })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.createPost = (req, res, next) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }
  // create post in db
  if (!req.file) {
    const error = new Error('No image provided.')
    error.statusCode = 422
    throw error
  }

  const imageUrl = req.file.path.replace('\\', '/')
  const title = req.body.title
  const content = req.body.content
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: 'Samuel' },
  })

  post.save().then(result => {
    res.status(201).json({
      message: 'Post created succesfuly',
      post: result
    })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId).then(post => {
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    res.status(200).json({ message: 'Post fetched', post: post })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId
  console.log(postId)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }
  const { title, content } = req.body
  let imageUrl = req.body.image;
  if (req.file) {
    console.log(req.file.path)
    imageUrl = req.file.path.replace('\\', '/')
  }
  if (!imageUrl) {
    const error = new Error('No file picked.')
    error.statusCode = 422
    throw error
  }
  Post.findById(postId).then(post => {
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }
    post.title = title
    post.imageUrl = imageUrl
    post.content = content
    return post.save()
  }).then(result => {
    res.status(200).json({ message: 'Post updated!', post: result })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.deletePost = (req, res, next ) => {
  const postId = req.params.postId;
  Post.findById(postId).then(post => {
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    // check logged in user

    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId)
  }).then(result => {
    console.log(result)
    res.status(200).json({ message: 'Deleted Post!' })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

const clearImage = (filePath) => {
  console.log(filePath)
  filePath = path.join(__dirname, '..', filePath)
  console.log(filePath)
  fs.unlink(filePath, err => console.log(err))
}
