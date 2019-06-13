'use strict';

// Load Environment Variable from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
// console.log(client);
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
app.get('/test', (request, response) => response.send('hi there'));

// Route Handlers
function handleLocation(request, response){
  getLocation(request.query.data)
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

function getLocation(query){
  const sql = `SELECT * FROM locations WHERE search_query='${query}'`;
  return client.query(sql).then( () => 'woohoo').catch( () => console.error('ouch'));
}

function xxxxgetLocation(query){
  const sql = `SELECT * FROM locations WHERE search_query='${query}'`;
  // return 'getting location';

  // console.log(sql);
  return client.query(sql)
    .then(results => {
      console.log('............db search complete');
      if (results.rowCount > 0){
        console.log('........ from cache');
        return results.rowCount;
      } else {
        const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
        return superagent.get(URL)
          .then(response => {
            let location = new Location(query, response.body.results[0]);
            const insertSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ('${location.search_query}', '${location.formatted_query}', ${location.latitude}, ${location.longitude});`;
            return client.query(insertSQL)
              .then(results => {
                console.log('insert status', results.rows);
                console.log('........ from api and cached');
                return location;
              })
              .catch(error => console.error(error));
          })
          .catch(error => console.error(error));
      }
    })
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
function Location(query, rawData){
  this.search_query = query;
  this.formatted_query = rawData.formatted_address;
  this.latitude = rawData.geometry.location.lat;
  this.longitude = rawData.geometry.location.lng;
}

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
