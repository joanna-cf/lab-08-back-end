// Route Handlers
function getLocation(query, client, superagent){
  // console.log('........../////client', client);
  return getLocationFromDatabase(query, client)
    .then(location => {
      console.log('LOCATION!!!!', location);
      if (location){
        return location;
      } else {
        return getLocationFromAPI(query, client, superagent);
      }
    });
  // return getLocationFromAPI(query, client, superagent)
  //   .then(location => cacheLocation(location, client))
  //   .catch(error => console.error(error));
}

function getLocationFromDatabase(query, client){
  const sqlSelect = `SELECT * FROM locations WHERE search_query='${query}'`;
  client.query(sqlSelect)
    .then(result => {
      // console.log('!!!!!!result', result.rows[0])
      return result.rows[0]});
}

function getLocationFromAPI(query, client, superagent) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent
    .get(URL)
    .then(response => new Location(query, response.body.results[0]))
    .then(location => cacheLocation(location, client));
}

function cacheLocation(location, client){
  const insertSQL = 
  `INSERT INTO locations (search_query, formatted_query, latitude, longitude) 
  VALUES ('${location.search_query}', '${location.formatted_query}', ${location.latitude}, ${location.longitude});`;

  return client.query(insertSQL).then(results => location);
}

function Location(query, rawData){
  this.search_query = query;
  this.formatted_query = rawData.formatted_address;
  this.latitude = rawData.geometry.location.lat;
  this.longitude = rawData.geometry.location.lng;
}

module.exports = getLocation;
