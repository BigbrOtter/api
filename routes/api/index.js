// Dependencies
const express = require('express')
const router = express.Router()

// Routes
const chatRoutes = require('./chat')
const streamRoutes = require('./stream')

// Use Routes
router.use('/chat', chatRoutes)
router.use('/stream', streamRoutes)

// Export Routes
module.exports = router
