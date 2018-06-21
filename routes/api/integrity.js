// Dependencies
const express = require('express')
const router = express.Router()

// Controller
const integrityController = require('../../controllers/api/integrity')

// Begin Chat Endpoints
router.post('/:file', integrityController.handlePost)
router.get('/:file', integrityController.handleGet)
// End Chat Endpoints

// Export Routes
module.exports = router
