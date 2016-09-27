var assert = require('assert');
var http = require('http');
var index = require('../routes/index');
var queries = require('../queries');
var request = require('supertest');

// Nova API endpoint tests
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

  // GET /api/widget endpoint
  describe('GET /api/wiget endpoint', function() {
    // 403 when missing API key
    it('responds with 403 when missing API key', function testWidget(done) {
      request(server)
        .get('/api/widget')
        .expect(403, done);
    });

    // 403 when invalid API key
    it('responds with 403 when invalid API key', function testWidget(done) {
      request(server)
        .get('/api/widget/?api_key=invalid')
        .expect(403, done);
    });

    // 200 when valid API key
    it('responds with 200 when valid API key', function testWidget(done) {
      request(server)
        .get('/api/widget/?api_key=nova_test')
        .expect(200, done);
    });
  });

  function testGetAllEndpoint(table) {
    describe('GET /api/' + table + ' endpoint', function() {
      it('responds with 200 and valid message', function testRequest(done) {
        request(server)
          .get('/api/' + table)
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
    });
  }

  // GET /api/requests endpoint
  testGetAllEndpoint('requests');

  // GET /api/responses endpoint
  testGetAllEndpoint('responses');

  // GET /api/clients endpoint
  testGetAllEndpoint('clients');

  // POST /api/submit endpoint
  describe('POST /api/submit endpoint', function() {
    // 500 on invalid API key
    it('responds with 500 on invalid API key', function
      testInvalidSubmitRequest(done) {
      request(server)
        .post('/api/submit')
        .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'US',
          'passport': '1234', 'api_key': 'nova'})
        .expect(500, done);
    });

    // 200 on valid API key, accept application for Mexico
    it('responds with 200 and accepts valid applications from Mexico',
      function testValidSubmitRequest(done) {
      request(server)
        .post('/api/submit')
        .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'Mexico',
          'passport': '1234', 'api_key': 'nova_test'})
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

    // 200 on valid API key, deny application from outside of Mexico
    it('responds with 200 and denies valid applications from other countries',
      function testValidSubmitRequest(done) {
      request(server)
        .post('/api/submit')
        .send({'name': 'Nova', 'email': 'nova@nova.com', 'country': 'India',
          'passport': '1234', 'api_key': 'nova_test'})
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

  // GET inexistent endpoint
  describe('GET inexistent endpoint', function() {
    it('responds with 404', function test404(done) {
      request(server)
        .get('/foo/bar')
        .expect(404, done);
    });
  });
});
