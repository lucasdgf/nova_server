var express = require('express');
var fs = require("fs")
var router = express.Router();

var db = require('../queries');

/* GET iFrame HTML. */
router.get('/api/widget', function(req, res, next) {
  fs.readFile('public/html/iframe-content.html', "binary", function(err, file) {
    if(err) {        
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
    }
    res.writeHead(200);
    res.write(file, "binary");
    res.end();
  });
});

/* Process request */
router.post('/api/submit', db.processRequest);

/* Get all requests */
router.get('/api/requests', db.getAllRequests);

/* Get all responses */
router.get('/api/responses', db.getAllResponses);

/* Get all clients */
router.get('/api/clients', db.getAllClients);

module.exports = router;