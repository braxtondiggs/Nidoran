import * as cors from 'cors';
import * as moment from 'moment';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const app = express();
const Spotify = require('node-spotify-api');
const spotify_key = functions.config().spotify;

app.use(cors({ origin: true }));

app.post('*', async (request, response) => {
  if (request.body.data) {
    const spotify = new Spotify({
      id: spotify_key.id,
      secret: spotify_key.secret
    });
    const split = request.body.data.split(' by ', 2);
    const search = await spotify.search({
      limit: 1,
      query: `${split[0]} ${split[1]}`,
      type: 'track'
    });
    const track = search.tracks.items[0];
    const artist = await spotify.request(`https://api.spotify.com/v1/artists/${track.artists[0].id}`);
    track.genres = artist.genres;
    const oTrack = {
      artist: track.artists.map((o: any) => admin.firestore().doc(`Artist/${o.id}`)),
      created: moment().toDate(),
      duration: track.duration_ms,
      externalURL: track.external_urls.spotify,
      genres: track.genres,
      id: track.id,
      image: track.album.images[0].url,
      name: track.name,
      query: request.body.data
    };

    const oArtist = {
      externalURL: artist.external_urls.spotify,
      id: artist.id,
      image: artist.images[0].url,
      name: artist.name
    }
    await oTrack.artist.forEach(async (ref: any) => {
      const artistDB = await ref.get();
      if (!artistDB.exists) {
        await ref.set(oArtist);
      }
    });
    const lastTrack = await admin.firestore().collection('Track').orderBy('created', 'desc').limit(1).get();
    await lastTrack.forEach(async (doc: any) => {
      if (track.id !== doc.data().id) {
        await admin.firestore().collection('Track').add(oTrack);
      }
    });
    const data = Object.assign({}, oTrack);
    data.artist = track.artists.map((o: any) => o.name);
    response.send(data);
  } else {
    response.status(422);
  }
});

export const listener = functions.https.onRequest(app);
