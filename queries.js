var promise = require('bluebird');

var options = {
  promiseLib: promise
};

// Make Postgres connection
var pgp = require('pg-promise')(options);
var connectionString = 'postgres://lsoocztuvlyeym:JvRePL5xVLGQ46P2GKprVO1KHQ'
  + '@ec2-54-243-202-110.compute-1.amazonaws.com:5432/dcaktg7ij2eq5g?ssl=true';
var db = pgp(connectionString);


function validateWidget(req, res, next) {
  // Check for API key as URL parameter
  if (!req.query.hasOwnProperty('api_key')) {
    var err = new Error('Missing API key');
    err.status = 403;
    next(err);
  }
  else {
    // Verify if API key is valid
    db.one('select * from clients where api_key = $1', req.query.api_key)
      .then(function (data) {
        res.render('widget', {api_key: req.query.api_key});
      })
      .catch(function (err) {
        var err = new Error('Invalid API key');
        err.status = 403;
        next(err);
      });
  }
}

// Gets all entries from a given table
function getAll(table, res) {
  db.any('select * from ' + table)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all ' + table
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Query database for all logged requests
function getAllRequests(req, res, next) {
  getAll('requests', res);
}

// Query database for all logged responses
function getAllResponses(req, res, next) {
  getAll('responses', res);
}

// Query database for all Nova clients (lenders)
function getAllClients(req, res, next) {
  getAll('clients', res);
}

// Process application request
function processRequest(req, res, next) {
  // Fetch lender ID
  db.one('select * from clients where api_key = $1', req.body.api_key)
    .then(function (data) {
      req.body.lender_id = data.id;
      // Log request and include lender id
      db.result('insert into requests(country, name, email, passport, lender_id)' +
          'values(${country}, ${name}, ${email}, ${passport}, ${lender_id}) returning id, country', req.body)
        .then(function (result) {
          // Generate mock response: only accept applications from Mexico
          var response = req.body.country === 'Mexico' ? true : false;
          var message = response ? 'You\'ve been approved!' : 'We\'re sorry to inform that you\'ve been denied';

          // Log response and include request id
          db.none('insert into responses(request_id, response)' +
              'values($1, $2)', [result.rows[0].id, response])
            .then(function () { 
              res.status(200)
                .json({
                  status: response,
                  message: message
                });
            })
            .catch(function (err) {
              return next(err);
          });
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Export functions
module.exports = {
  validateWidget: validateWidget,
  getAllRequests: getAllRequests,
  getAllResponses: getAllResponses,
  getAllClients: getAllClients,
  processRequest: processRequest
};