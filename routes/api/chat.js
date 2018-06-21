// Dependencies
const express = require('express')
const router = express.Router()

// Controller
const chatController = require('../../controllers/api/chat')

// Begin Chat Endpoints
router.post('', chatController.postChat)
router.get('', chatController.getChats)
// End Chat Endpoints

// Export Routes
module.exports = router
