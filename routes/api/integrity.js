// Dependencies
const express = require('express')
const router = express.Router()

// Controller
const integrityController = require('../../controllers/api/integrity')

// Begin Chat Endpoints
router.post('', integrityController.handlePost)
router.get('', integrityController.handleGet)
// End Chat Endpoints

// Export Routes
module.exports = router
