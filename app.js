const express = require('express')
const mongoose = require('mongoose')
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')
const uuidv4 = require('uuid/v4')
const multer = require('multer')
const path = require('path')
require('dotenv').config()
const app = express()


app.use('/images', express.static(path.join(__dirname, 'images')))
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
app.use(express.json())
app.use(multer({storage: fileStorage, fileFilter: fileFilter }).single('image'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})
app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})

mongoose.connect(
  process.env.DATABASE_URI, { useNewUrlParser: true }).then(result => {
  app.listen(8080, () => {
    console.log('api server running')
  })
}).catch(err => console.log(err));
