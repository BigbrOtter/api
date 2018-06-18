// Dependencies
const express = require('express')
const router = express.Router()

// Routes
const apiRoutes = require('./api')

// Use Routes
router.use('/api', apiRoutes)

// Export Routes
module.exports = router
