'use strict';

// Load Environment Variable from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.error(error));

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// Get all the things
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/events', handleEvents);

// internal modules
const getLocation = require('./js/location');
const getWeather = require('./js/weather');
const getEvents = require('./js/events');

// Route Handlers
function handleLocation(request, response){
  getLocation(request.query.data, client, superagent)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
}

function handleWeather(request, response){
  getWeather(request.query, superagent)
    .then(weather => response.send(weather))
    .catch(error => handleError(error, response))
}

function handleEvents(request, response){
  getEvents(request.query, superagent)
    .then(data => response.send(data))
    .catch(error => handleError(error));
}

// Error handling
function handleError(error, response) {
  console.error(error);
  response.status(500).send('Sorry, something went wrong')
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));