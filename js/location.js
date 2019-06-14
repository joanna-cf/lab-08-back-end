// Route Handlers
function getLocation(query, superagent){
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(URL)
    .then(response => {
      let location = new Location(query, response.body.results[0]);
      return location;
    })
    .catch(error => console.error(error));
}

function Location(query, rawData){
  this.search_query = query;
  this.formatted_query = rawData.formatted_address;
  this.latitude = rawData.geometry.location.lat;
  this.longitude = rawData.geometry.location.lng;
}

module.exports = getLocation;
