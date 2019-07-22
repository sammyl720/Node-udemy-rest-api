const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')
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
  let creator
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  })

  post.save().then(result => {
    return User.findById(req.userId)  
  }).then(user => {
    creator = user
    user.posts.push(post)
    return user.save()
  }).then(result => {
    res.status(201).json({
      message: 'Post created succesfuly',
      post: post,
      creator: { _id: creator._id, name: creator.name }
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
    if (post.creator.toString() !== req.userId) {
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
    if (post.creator.toString() !== req.userId) {
      const err = new Error('Not authorized')
      err.statusCode = 403
      throw err
    }
    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId)
  }).then(result => {
    return User.findById(req.userId)
  }).then(user => {
    user.posts.pull(postId)
    return user.save()
  }).then(result => {
    res.status(200).json({ message: 'Deleted Post!' })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.getStatus = (req, res, next ) => {
  if (!req.userId) {
    const error = new Error('No user')
    error.statusCode = 404
    throw error
  }
  User.findById(req.userId).then(user => {
    if (!user) {
      const error = new Error('No user')
      error.statusCode = 404
      throw error
    }
    return user.status
  }).then(status => {
    res.status(200).json({ status: status })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.postStatus = (req, res, next ) => {
  const updatedStatus = req.body.status
  if (!req.userId) {
    const error = new Error('No user')
    error.statusCode = 404
    throw error
  }
  User.findById(req.userId).then(user => {
    if (!user) {
      const error = new Error('No user')
      error.statusCode = 404
      throw error
    }

    user.status = updatedStatus
    return user.save()
  }).then(result => {
    res.status(200).json({ message: 'Updated status', status: result.status })
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
