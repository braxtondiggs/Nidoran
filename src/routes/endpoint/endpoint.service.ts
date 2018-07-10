import { IArtist, ITrack } from '../../schemas';
import { Utils } from '../../utils';
const humanizeDuration = require('humanize-duration');
import * as _ from 'lodash';

export class EndpointService {
  private utils: Utils = new Utils();

  public async totalDuration(range: string, start: string, end: string): Promise<{ formatted: string, value: number }> {
    const tracks: ITrack[] = await this.utils.getTracks(range, start, end);
    const duration: number = _.chain(tracks).map('duration').sum().value();
    return {
      formatted: humanizeDuration(duration, { round: true, delimiter: ' and ' }),
      value: duration
    };
  }

  public async topArtists(range: string, start: string, end: string): Promise<IArtist[]> {
    const tracks: ITrack[] = await this.utils.getTracks(range, start, end);
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
      promises.push(this.utils.getArtist(artist.name));
    });
    const response: any = await Promise.all(promises);
    _.forEach(response, (artist: IArtist, key: number) => {
      if (artist) {
        artists[key].image = artist.image;
        artists[key].externalURL = artist.externalURL;
      }
    });
    return artists;
  }

  public async topGenres(range: string, start: string, end: string): Promise<Array<{ count: number, name: string }>> {
    const tracks: ITrack[] = await this.utils.getTracks(range, start, end);
    return _.chain(tracks)
      .map('genres')
      .flatten()
      .map((o, key, genres) => ({
        count: _.size(genres.filter((value) => _.isEqual(value, o))),
        name: o
      }))
      .uniqBy('name')
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value();
  }

  public async topTracks(range: string, start: string, end: string): Promise<ITrack[]> {
    const tracks: ITrack[] = await this.utils.getTracks(range, start, end);
    return _.chain(tracks)
      .groupBy('id')
      .map((items) => (items[0].count = items.length, _.omit(items[0], ['_id', 'id', 'query'])))
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value() as ITrack[];
  }
}

export default EndpointService;
