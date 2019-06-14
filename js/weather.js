function getWeather(query, superagent){
  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.data.latitude},${query.data.longitude}`;
  return superagent.get(URL)
    .then(response => response.body.daily.data.map(day => new Weather(day)))
    .catch(error => console.error(error));
}

function Weather(darkSkyData){
  this.forecast = darkSkyData.summary;
  this.time = new Date(darkSkyData.time * 1000).toDateString();
}

module.exports = getWeather;
