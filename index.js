'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const _ = require('lodash');
const app = express();
const MongoDB = require('./app/mongo.js');
const { dialogflow, BasicCard, Button, Image } = require('actions-on-google');
const APIEndPoint = require('./app/api/api.controller.js');
const io = require('socket.io-client');
const socket = io.connect('https://braxtondiggs.com', { transports: ['websocket', 'polling'] });
let spotify = new Spotify({
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
});
app.use(bodyParser.urlencoded({
  extended: true
}));
const googleActions = dialogflow();
app.use(bodyParser.json(), googleActions);
app.use(errorHandler);
app.use(cors());

app.use('/api', require('./app/api'));

app.get('/', (req, res, next) => {
  MongoDB.get(req.query.range, req.query.start, req.query.end).then(data => {
    Promise.all([
      APIEndPoint.topArtists(data),
      APIEndPoint.topGenres(data),
      APIEndPoint.topTracks(data),
      APIEndPoint.totalDuration(data)
    ]).then(([artists, genres, tracks, duration]) => {
      res.json({
        artists,
        genres,
        tracks,
        duration
      });
    }).catch(err => next(err));
  }).catch(err => next(err));
});

app.post('/webhook', (req, res, next) => {
  const sep = ' by ';
  let data = {
    formatted: req.body.data
  };
  if (data.formatted && _.includes(data.formatted, sep)) {
    let index = data.formatted.lastIndexOf(sep);
    data.track = data.formatted.substring(0, index);
    data.artist = data.formatted.substring(index + 4);
    spotify.search({
      type: 'track',
      query: `${data.track} ${data.artist}`,
      limit: 1
    }, (err, response) => {
      if (err) return next(err);
      let track = response.tracks.items[0];
      spotify.request(`https://api.spotify.com/v1/artists/${track.artists[0].id}`, (err, artist) => {
        if (err) return next(err);
        track.genres = artist.genres;
        const output = formatOutput(track);
        output.query = data.formatted;
        MongoDB.save(output, formatArtist(artist)).then(() => {
          const socketPacket = output;
          socketPacket.artist = formatArtist(artist);
          socket.emit('track', socketPacket);
          res.json(output);
        }).catch(err => next(err));
      });
    });
  } else {
    return next('Incorrect Params');
  }
});

const server = app.listen(process.env.PORT || 8080, () => {
  var port = server.address().port;
  console.log('App now running on port', port);
});

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(500).send(err);
}

function formatOutput(track) {
  return {
    id: track.id,
    name: track.name,
    genres: track.genres,
    created: moment().toISOString(),
    externalURL: track.external_urls.spotify,
    duration: track.duration_ms,
    artist: _.map(track.artists, 'name'),
    image: track.album.images[0].url
  };
}

function formatArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    externalURL: artist.external_urls.spotify,
    image: _.first(artist.images).url
  };
}

googleActions.intent('Last Track', async conv => {
  const data = await MongoDB.last();
  conv.close(new BasicCard({
    title: `The last song played was ${data[0].query}`,
    image: new Image({
      url: data[0].image,
      alt: data[0].artist[0]
    }),
    buttons: new Button({
      title: data[0].query,
      url: data[0].externalURL
    })
  }));
});
