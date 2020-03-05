import * as functions from 'firebase-functions';
import { getLastTrack, getTopTrack, getLastArtist, getTopArtist } from './endpoint';
import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));

app.get('/track/last', async (_req, res) => res.send(await getLastTrack()));
app.get('/track/top', async (req, res) => res.send(await getTopTrack(req.query)));
app.get('/artist/last', async (_req, res) => res.send(await getLastArtist()));
app.get('/artist/top', async (req, res) => res.send(await getTopArtist(req.query)));
/*app.get('/genre/last', async (_req, res) => res.send(await getLastGenre()));
app.get('/genre/top', async (_req, res) => res.send(await getTopGenre()));
app.get('/duration', async (_req, res) => res.send(await getDuration()));*/

exports.endpoint = functions.https.onRequest(app);
