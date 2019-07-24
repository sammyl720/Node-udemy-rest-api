const { validationResult } = require('express-validator')

const io = require('../socket')
const Post = require('../models/post')
const User = require('../models/user')
const fs = require('fs')
const path = require('path')

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find().skip((currentPage - 1) * perPage).populate('creator').sort({ createdAt: -1 }).limit(perPage)
    res.status(200).json({ message: 'Fetched posts succesfully', posts: posts, totalItems: totalItems })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.createPost = async (req, res, next) => {

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
    creator: req.userId
  })
  try {
    const postResult = await post.save()
    const user = await User.findById(req.userId)
    user.posts.push(post)
    await user.save()
    io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: { _id: req.userId, name: user.name } } })
    res.status(201).json({
      message: 'Post created succesfuly',
      post: postResult,
      creator: { _id: user._id, name: user.name }
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId).populate('creator')
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    res.status(200).json({ message: 'Post fetched', post: post })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }
  const { title, content } = req.body
  let imageUrl = req.body.image
  console.log(imageUrl)
  if (req.file) {
    console.log(req.file.path)
    imageUrl = req.file.path.replace('\\', '/')
  }
  if (!imageUrl) {
    const error = new Error('No file picked.')
    error.statusCode = 422
    throw error
  }
  try {
    const post = await Post.findById(postId).populate('creator')
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    if (post.creator._id.toString() !== req.userId) {
      const err = new Error('Not authorized')
      err.statusCode = 403
      throw err
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }
    post.title = title
    post.imageUrl = imageUrl
    post.content = content
    const result = await post.save()
    io.getIO().emit('posts', { action: 'update', post: result })
    res.status(200).json({ message: 'Post updated!', post: result })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deletePost = async (req, res, next ) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const err = new Error('Could not find post')
      err.statusCode = 422
      throw err
    }
    if (post.creator.toString() !== req.userId) {
      const err = new Error('Not authorized')
      err.statusCode = 403
      throw err
    }
    await clearImage(post.imageUrl)
    await Post.findByIdAndRemove(postId, { useFindAndModify: false })
    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()
    io.getIO().emit('posts', { action: 'delete', post: postId })
    res.status(200).json({ message: 'Deleted Post!' })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getStatus = async (req, res, next ) => {
  if (!req.userId) {
    const error = new Error('No user')
    error.statusCode = 404
    throw error
  }
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('No user')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({ status: user.status })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.postStatus = async (req, res, next ) => {
  console.log(req.body)
  const updatedStatus = req.body.status
  if (!req.userId) {
    const error = new Error('No user')
    error.statusCode = 404
    throw error
  }
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('No user')
      error.statusCode = 404
      throw error
    }
    console.log(updatedStatus)
    user.status = updatedStatus
    const result = await user.save()
    res.status(200).json({ message: 'Updated status', status: result.status })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
const clearImage = (filePath) => {
  console.log(filePath)
  filePath = path.join(__dirname, '..', filePath)
  console.log(filePath)
  fs.unlink(filePath, err => console.log(err))
}
