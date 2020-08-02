const mongoose = require('mongoose')
const validator = require('validator')
const { connect } = require('http2')
const { validate } = require('@babel/types')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = mongoose.Schema({
  name : {
    required : true,
    trim : true,
    type : String
  },
  email : {
    required : true,
    unique : true,
    type : String,
    trim : true,
    lowercase : true,
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error ('Not a valid email')
      }
    }
  },
  age : {
    type : Number,
    default : 0,
    validate(value) {
      if(value < 0) {
        throw new Error ('Age cannot be less than 0')
      }
    }
  },
  password : {
    type : String,
    required : true,
    trim : true,
    minlength : 6,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error ('Cannot contain the string' + ' password')
      }
    }
  },
  avatar : {
    type : Buffer
  },
  tokens :[{
    token : {
      type : String,
      required : true
    }
  }]
}, {
  timestamps : true
})

userSchema.virtual('tasks', {
  ref : 'Task',
  localField : '_id',
  foreignField : 'owner'
})

userSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}

userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = await jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email,password) => {
  
  const user = await User.findOne({email})
  if(!user) {
    throw new Error('Unable to Login')
  }
  const isMatch = await bcryptjs.compare(password,user.password)
  if(!isMatch) {
    throw new Error('Unable to Login')
  }
  return user
}

userSchema.pre('save', async function(next) {
 const user = this
 if(user.isModified('password')) {
   user.password = await bcryptjs.hash(user.password,8)
   
 }
 next()
})

userSchema.pre('remove', async function(next) {
  const user = this
  await Task.deleteMany({owner : user._id})
  next()
})

const User = mongoose.model('User',userSchema)

module.exports = User