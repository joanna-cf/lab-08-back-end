function getEvents(query, superagent){
  const URL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${query.data.longitude}&location.latitude=${query.data.latitude}&expand=venue`;
  return superagent.get(URL)
    .set('Authorization', `Bearer ${process.env.EVENTBRITE_API_KEY}`)
    .then(data => data.body.events.map(event => new Event(event)))
    .catch(error => console.error(error));
}

// Constructor Functions
function Event(event){
  this.link = event.url,
  this.name = event.name.txt,
  this.event_date = event.start.local,
  this.summary = event.summary;
}

module.exports = getEvents;
