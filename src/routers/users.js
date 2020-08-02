const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail, sendCancelMail} = require('../emails/account')
const avatar = multer({
 // dest : 'avatars',
  limits : {
    fileSize : 1000000
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload a image'))
    }
    cb(undefined,true)
  }
})

router.post('/users',  async (req,res) => {
  const user = new User(req.body)
  try {
    const token = await user.generateAuthToken()
    await user.save()
    sendWelcomeMail(user.email, user.name)
    res.status(201).send({user,token})
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/users/login', async (req,res) => {
  try {
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({user,token})
  } catch (error) {
    res.status(400).send(error)
  }
  
})

router.post('/users/logout',auth, async (req,res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token!=req.token)
    await req.user.save()
    res.status(200).send('Logged out successfully!')
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/users/logoutall',auth,async (req,res) => {
try {
  req.user.tokens = []
  await req.user.save()
  res.status(200).send('Logged out from all devices successfully!')
} catch (error) {
  res.status(500).send(error)
}
})

router.post('/users/me/avatar', auth, avatar.single('avatar'),async (req,res) => {
 // const buffer = await sharp(req.file.buffer).resize({width:200, height:200}).png().toBuffer()
  const buffer = await sharp(req.file.buffer)
  .resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer
  await req.user.save()
  res.status(200).send('Avatar uploaded successfully!')
}, (error,req,res,next) => {
  res.status(400).send({error : error.message})
})

router.get('/users/me', auth, async (req,res) => {
  try {
    res.status(200).send(req.user)
  } catch (error) {
    res,status(400).send(error)
  }
})

router.get('/users/:id/avatar', async(req,res) => {
  try {
    const user = await User.findById(req.params.id)
    if(!user||!user.avatar) {
      throw new Error('Avatar doesnt exist')
    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
  } catch (error) {
    
  }
})
router.patch('/users/me', auth, async (req,res) => {
   try {
    const updates = Object.keys(req.body)
    const keys = ["name", "email", "age", "password"]
    const isValidKey = updates.every(update => keys.includes(update))
    if(!isValidKey) {
      return res.status(400).send('Not a valid field to update')
    }
    updates.map(update =>  req.user[update] = req.body[update])
    await req.user.save()
    res.status(200).send(req.user)
    
  } catch (error) {
    res.status(500).send(error)
  }
})

router.delete('/users/me', auth, async (req,res) => {
  try {
    await req.user.remove()
    sendCancelMail(req.user.email,req.user.name)
    res.status(200).send(req.user)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.delete('/users/me/avatar', auth, async (req,res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar deleted')
  } catch (error) {
    res.status(500).send(error)
  }
})
module.exports = router