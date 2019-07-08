'use strict';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import * as _ from 'lodash';
import * as moment from 'moment';
import { connect } from 'mongoose';
import * as io from 'socket.io-client';
import { Artist, IArtist, ITrack, Track } from '../../schemas';

const Spotify = require('node-spotify-api');
const spotify = new Spotify({
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
});
const socket = io('https://braxtondiggs.com', { transports: ['websocket', 'polling'] });
connect(process.env.MONGODB_URI as string);

export class WebHookController {
  public utils: any;
  public async index(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    const response: any = matchedData(req);
    const split = _.split(response.data, ' by ', 2);
    try {
      const search = await spotify.search({
        limit: 1,
        query: `${split[0]} ${split[1]}`,
        type: 'track'
      });
      const track = search.tracks.items[0];
      const artist = await spotify.request(`https://api.spotify.com/v1/artists/${track.artists[0].id}`);
      track.genres = artist.genres;
      const oTrack = {
        artist: _.map(track.artists, 'name'),
        created: moment().toISOString(),
        duration: track.duration_ms,
        externalURL: track.external_urls.spotify,
        genres: track.genres,
        id: track.id,
        image: track.album.images[0].url,
        name: track.name,
        query: response.data
      } as ITrack;

      const oArtist = {
        externalURL: artist.external_urls.spotify,
        id: artist.id,
        image: artist.images[0].url,
        name: artist.name
      } as IArtist;
      const lastTrack: ITrack = await this.utils.getLastTrack();
      if (track.id !== lastTrack.id) {
        await Track.create(oTrack);
        await Artist.findOneAndUpdate({ id: oArtist.id }, oArtist, { upsert: true });
        socket.emit('track', { track: oTrack, artist: oArtist });
      }
      res.json(oTrack);
    } catch (error) {
      next(error);
    }
  }
}

export default new WebHookController();
