// Dependencies
const express = require('express')
const router = express.Router()

// Controller
const streamController = require('../../controllers/api/stream')

// Begin Stream Endpoints
router.post('', streamController.postStream)
router.get('', streamController.getStream)
router.get(':streamId', streamController.getStreams)
router.delete(':streamId', streamController.delStream)
// End Stream Endpoints

// Export Routes
module.exports = router
