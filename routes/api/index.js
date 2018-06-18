// Dependencies
const express = require('express')
const router = express.Router()

// Routes
const chatRoutes = require('./chat')

// Use Routes
router.use('/chat', chatRoutes)

// Export Routes
module.exports = router
