// Dependencies
const express = require('express')
const router = express.Router()

// Routes
const chatRoutes = require('./chat')
const streamRoutes = require('./stream')
const integrityRoutes = require('./integrity')

// Use Routes
router.use('/chat', chatRoutes)
router.use('/streams', streamRoutes)
router.use('/integrity', integrityRoutes)

// Export Routes
module.exports = router
