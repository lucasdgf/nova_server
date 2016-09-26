DROP DATABASE IF EXISTS nova;
CREATE DATABASE nova;

\c nova;

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  country VARCHAR,
  name VARCHAR,
  email VARCHAR,
  passport VARCHAR,
  lender_id SERIAL
);

CREATE TABLE responses (
  request_id SERIAL PRIMARY KEY,
  response BOOLEAN
);

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  api_key VARCHAR UNIQUE
);

INSERT INTO clients (name, api_key) VALUES ('Wells Fargo', 'bmK56CFGfLno8TUn6wV1RGykEpW4');
INSERT INTO clients (name, api_key) VALUES ('Nova Test', 'nova_test');