const express = require('express')
require('./db/mongoose')
const { async } = require('q')
const { findByIdAndDelete } = require('./models/user')
const app = express()
const userRouter = require('../src/routers/users')
const taskRouter = require('../src/routers/tasks')
const multer = require('multer')
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=> {
  console.log('Server is running in port ',port)
})