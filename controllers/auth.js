const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }
  const { email, name, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      email,
      name,
      password: hashedPassword
    })
    const result = await user.save()
    res.status(201).json({ message: 'User created!', userId: result._id })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body
  let loadedUser
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new Error('User with this email not found')
      error.statusCode = 401
      throw error
    }
    loadedUser = user
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      const error = new Error('Wrong password!')
      error.statusCode = 401
      throw error
    }
    // create json web token: JWT
    const token = jwt.sign({
      email: loadedUser.email,
      id: loadedUser._id.toString()
    }, 'secret-token-123', {
      expiresIn: '1h'
    })
    res.status(200).json({ token: token, userId: loadedUser._id.toString() })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
