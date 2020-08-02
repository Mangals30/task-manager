const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/users',  async (req,res) => {
  const user = new User(req.body)
  try {
    const token = await user.generateAuthToken()
    await user.save()
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

router.get('/users', auth, async (req,res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (error) {
    res.send(error)
  }
})

router.get('/users/me', auth, async (req,res) => {
  res.send(req.user)
})

router.get('/users/:id', async (req,res) => {
  try {
    const _id = req.params.id
    const user = await User.findById(_id)
    if(!user) {
      return res.status(404).send('No user with the matchind ID!')
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.patch('/users/:id', async (req,res) => {
   try {
    const user = await User.findByIdAndUpdate(req.params.id)
    if(!user) {
      return res.status(400).send('User doesnt exist')
    }
    const updates = Object.keys(req.body)
    const keys = ["name", "email", "age", "password"]
    const isValidKey = updates.every(update => keys.includes(update))
    if(!isValidKey) {
      return res.status(400).send('Not a valid field to update')
    }
    updates.map(update =>  user[update] = req.body[update])
   /*updates.map((update) => {
     console.log('user update ', user[update])
     console.log('req body update ', req.body[update])
     return user[update] = req.body[update]
   })*/
    await user.save()
    res.status(200).send(user)
    //const user = await User.findByIdAndUpdate(req.params.id,req.body, {new : true, runValidators : true})
  } catch (error) {
    res.status(500).send(error)
  }
})

router.delete('/users/:id', async (req,res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user) {
      return res.status(400).send('No user matching with the ID')
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})


module.exports = router