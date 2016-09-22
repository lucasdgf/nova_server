var assert = require('assert');
var fs = require('fs');
var http = require('http');
var index = require('../routes/index');
var queries = require('../queries');
var request = require('supertest');

// Tests for the Nova API endpoint
describe('Nova API Testing', function () {
  var server;
  var httpServer;

  beforeEach(function () {
    server = require('../app');
    httpServer = http.createServer(server);
    httpServer.listen('8080')
  });

  afterEach(function () {
    httpServer.close();
  });

  // Test GET /api/widget endpoint
  it('responds to /api/widget', function testWidget(done) {
    iframeFile = fs.readFileSync('public/html/iframe-content.html', "binary");
    request(server)
      .get('/api/widget')
      .expect(200)
      .end(function(err, res) {
        assert(res.text == iframeFile);
      });
      done();
  });

  // Test GET /api/requests endpoint
  it('responds to /api/requests', function testRequests(done) {
    request(server)
      .get('/api/requests')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        res.body.hasOwnProperty('status');
        res.body.hasOwnProperty('data');
        res.body.hasOwnProperty('message');
        done();
      });
  });

  // Test GET /api/responses endpoint
  it('responds to /api/responses', function testResponses(done) {
    request(server)
      .get('/api/responses')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        res.body.hasOwnProperty('status');
        res.body.hasOwnProperty('data');
        res.body.hasOwnProperty('message');
        done();
      });
  });

  // Test GET /api/clients endpoint
  it('responds to /api/clients', function testClients(done) {
    request(server)
      .get('/api/clients')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        res.body.hasOwnProperty('status');
        res.body.hasOwnProperty('data');
        res.body.hasOwnProperty('message');
        done();
      });
  });

  // Test GET /api/widget endpoint
  it('404 everything else', function test404(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });

  // Test valid and successful POST /api/submit request
  it('responds to /api/submit on valid API key', function testValidSubmitRequest(done) {
    request(server)
      .post('/api/submit')
      .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'US', 'passport': '1234', 'api_key': 'bmK56CFGfLno8TUn6wV1RGykEpW4'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        content = JSON.parse(res.text);
        assert(content.hasOwnProperty('message'));
        assert(content.hasOwnProperty('status'));
        done();
      });
  });

  // Test invalid POST /api/submit request
  it('responds to /api/submit with 500 on invalid API key', function testInvalidSubmitRequest(done) {
    request(server)
      .post('/api/submit')
      .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'US', 'passport': '1234', 'api_key': 'nova'})
      .expect(500, done);
  });

  // Test application to be accepted
  it('accepts applications from Mexico', function testValidSubmitRequest(done) {
    request(server)
      .post('/api/submit')
      .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'Mexico', 'passport': '1234', 'api_key': 'bmK56CFGfLno8TUn6wV1RGykEpW4'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        content = JSON.parse(res.text);
        assert(content.status == true);
        assert(content.message == 'You\'ve been approved!');
        done();
      });
  });

  // Test application to be denied
  it('denies applications from other countries', function testValidSubmitRequest(done) {
    request(server)
      .post('/api/submit')
      .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'India', 'passport': '1234', 'api_key': 'bmK56CFGfLno8TUn6wV1RGykEpW4'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        content = JSON.parse(res.text);
        assert(content.status == false);
        assert(content.message == 'We\'re sorry to inform that you\'ve been denied');
        done();
      });
  });
});
