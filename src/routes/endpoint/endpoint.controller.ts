'use strict';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator/filter';
import * as _ from 'lodash';
import { connect } from 'mongoose';
import { IArtist, ITrack } from '../../schemas';

const humanizeDuration = require('humanize-duration');
connect(process.env.MONGODB_URI as string);

class EndpointController {
  public utils: any;
  public async totalDuration(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    const tracks: ITrack[] = await this.utils.getTracks(query.range, query.start, query.end);
    const duration: number = _.chain(tracks).map('duration').sum().value();
    res.json({
      formatted: humanizeDuration(duration, { round: true }),
      value: duration
    });
  }

  public async topArtists(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    const tracks: ITrack[] = await this.utils.getTracks(query.range, query.start, query.end);
    const artists: IArtist[] = _.chain(tracks)
      .map('artist')
      .flatten()
      .map((o, key, collection) => ({
        count: _.size(collection.filter((value) => _.isEqual(value, o))),
        name: o
      }) as IArtist)
      .uniqBy('name')
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value();
    const promises: any = [];
    _.forEach(artists, (artist: IArtist) => {
      promises.push(this.utils.getArtist(artist.name) as IArtist);
    });
    const response: any = await Promise.all(promises);
    _.forEach(response, (artist: IArtist, key: number) => {
      artists[key].image = artist.image;
    });
    res.json(artists);
  }

  public async topGenres(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    const tracks: ITrack[] = await this.utils.getTracks(query.range, query.start, query.end);
    res.json(
      _.chain(tracks)
        .map('genres')
        .flatten()
        .map((o, key, genres) => ({
          count: _.size(genres.filter((value) => _.isEqual(value, o))),
          name: o
        }))
        .uniqBy('name')
        .orderBy('count', 'desc')
        .slice(0, 10)
        .value()
    );
  }

  public async topTracks(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    const tracks: ITrack[] = await this.utils.getTracks(query.range, query.start, query.end);
    res.json(
      _.chain(tracks)
        .groupBy('id')
        .map((items) => (items[0].count = items.length, _.omit(items[0], ['_id', 'id', 'query'])))
        .orderBy('count', 'desc')
        .slice(0, 10)
        .value()
    );
  }

  public async lastTrack(req: Request, res: Response) {
    const track: ITrack = await this.utils.getLastTrack();
    res.json(track);
  }
}

export default new EndpointController();
