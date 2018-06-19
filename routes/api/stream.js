// Dependencies
const express = require('express')
const router = express.Router()

// Controller
const streamController = require('../../controllers/api/stream')

// Begin Stream Endpoints
router.post('', streamController.postStream)
router.get('', streamController.getStreams)
router.get(':streamId', streamController.getStream)
router.delete(':streamId', streamController.delStream)
// End Stream Endpoints

// Export Routes
module.exports = router
