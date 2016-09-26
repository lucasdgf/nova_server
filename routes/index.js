var express = require('express');
var router = express.Router();

var db = require('../queries');

// Serve Nova widget
router.get('/api/widget', db.validateWidget);

// Process application request
router.post('/api/submit', db.processRequest);

// Get all application requests
router.get('/api/requests', db.getAllRequests);

// Get all application responses
router.get('/api/responses', db.getAllResponses);

// Get all Nova clients (lenders)
router.get('/api/clients', db.getAllClients);

module.exports = router;