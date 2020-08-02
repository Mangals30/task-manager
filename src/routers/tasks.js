const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { update } = require('../models/task')


router.post('/tasks', auth,async (req,res) => {
  try {
    const task = new Task({
      ...req.body, owner : req.user._id
    })
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

router.get('/tasks', auth, async (req,res) => {
 try {
   let match = {}
   const sort = {}
   if(req.query.completed) {
     match.completed = (req.query.completed === 'true')
   }
   if(req.query.sortBy) {
     const parts = req.query.sortBy.split(':')
     sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1)
   }
   
  await req.user.populate({
    path : 'tasks',
    match,
    options : {
      limit : parseInt(req.query.limit),
      skip : parseInt(req.query.skip),
      sort
    }
  }).execPopulate()
  res.status(200).send(req.user.tasks)
 } catch (error) {
   res.status(400).send(error)
 }
})

router.get('/tasks/:id', auth, async (req,res) => {
  try {
    const _id = req.params.id
    const task = await Task.findById({_id, owner : req.user._id})
    if(!task) {
      return res.status(404).send('Task not found')
    }
    res.status(200).send(task)
  } catch (error) {
    res.status(400).send(error)  
  }
})

router.patch('/tasks/:id', auth,async (req,res) => {
  try {
    const updates = Object.keys(req.body)
    const keys = ['description', 'completed']
    const isValidKey = updates.every(update => keys.includes(update))
    if(!isValidKey) {
     return res.status(400).send('Not a valid field to update!')
    }
    const task = await Task.findOne({_id : req.params.id, owner : req.user._id})
    
    if(!task) {
      return res.status(404).send('No task exist')
    }
    updates.map(update => task[update] = req.body[update])
    await task.save()

    //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators : true})
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.delete('/tasks/:id', auth,async (req,res) => {
  try {
    const task = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})
    if(!task) {
      return res.status(400).send('No task matched the ID')
    }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router