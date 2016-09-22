var promise = require('bluebird');

var options = {
  promiseLib: promise
};

// Make Postgres connection
var pgp = require('pg-promise')(options);
var connectionString = 'postgres://lsoocztuvlyeym:JvRePL5xVLGQ46P2GKprVO1KHQ'
  + '@ec2-54-243-202-110.compute-1.amazonaws.com:5432/dcaktg7ij2eq5g?ssl=true';
var db = pgp(connectionString);

// Query database for all logged requests
function getAllRequests(req, res, next) {
  db.any('select * from requests')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all requests'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Query database for all logged responses
function getAllResponses(req, res, next) {
  db.any('select * from responses')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all responses'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Query database for all Nova clients (lenders)
function getAllClients(req, res, next) {
  db.any('select * from clients')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all clients'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Process application request
function processRequest(req, res, next) {
  // Verify if API key is valid
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
  getAllRequests: getAllRequests,
  getAllResponses: getAllResponses,
  getAllClients: getAllClients,
  processRequest: processRequest
};