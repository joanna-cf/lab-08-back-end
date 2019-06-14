'use strict';

// Load Environment Variable from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

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

// Route Handlers
function handleLocation(request, response){
  getLocation(request.query.data, superagent)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
}

function handleWeather(request, response){
  getWeather(request.query)
    .then(weather => response.send(weather))
    .catch(error => handleError(error, response))
}

function handleEvents(request, response){
  getEvents(request.query)
    .then(data => response.send(data))
    .catch(error => handleError(error));
}


function getWeather(query){
  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.data.latitude},${query.data.longitude}`;
  return superagent.get(URL)
    .then(response => response.body.daily.data.map(day => new Weather(day)))
    .catch(error => console.error(error));
}

function getEvents(query){
  const URL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${query.data.longitude}&location.latitude=${query.data.latitude}&expand=venue`;
  return superagent.get(URL)
    .set('Authorization', `Bearer ${process.env.EVENTBRITE_API_KEY}`)
    .then(data => data.body.events.map(event => new Event(event)))
    .catch(error => console.error(error));
}

// Constructor Functions

function Weather(darkSkyData){
  this.forecast = darkSkyData.summary;
  this.time = new Date(darkSkyData.time * 1000).toDateString();
}

function Event(event){
  this.link = event.url,
  this.name = event.name.txt,
  this.event_date = event.start.local,
  this.summary = event.summary;
}

// Error handling
function handleError(error, response) {
  console.error(error);
  response.status(500).send('Sorry, something went wrong')
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));