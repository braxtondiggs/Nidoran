import db from './shared/db';
import { Utils } from './shared/utils';
import { Track, Artist } from './interfaces';
import * as _ from 'lodash';

const utils = new Utils();
export async function getLastTrack(): Promise<Track> {
  const lastTrack = await db.collection('tracks').orderBy('created', 'desc').limit(1).get();
  return lastTrack.docs[0].data() as Track;
}

export async function getTopTrack(query: { [key: string]: string; }): Promise<Track[]> {
  return _.chain(await getTracks(query))
    .groupBy('id')
    // tslint:disable-next-line: ban-comma-operator
    .map((items: any) => (items[0].count = items.length, _.omit(items[0], ['id', 'query'])))
    .orderBy('count', 'desc')
    .slice(0, 10)
    .value() as Track[];
}

export async function getLastArtist(): Promise<{ name: string }> {
  const lastTrack = await getLastTrack();
  return { name: lastTrack.artist[0] };
}

export async function getTopArtist(query: { [key: string]: string; }): Promise<any> {
  const artists = _.chain(await getTracks(query))
    .map('artist')
    .flatten()
    .map((o, _key, collection) => ({
      count: _.size(_.filter(collection, (value) => _.isEqual(value, o))),
      name: o
    }) as Artist)
    .uniqBy('name')
    .orderBy('count', 'desc')
    .slice(0, 10)
    .value();

  const promise = artists.map(async (artist) => await db.collection('artists').where('name', '==', artist.name).limit(1).get());
  const response = await Promise.all(promise);
  _.forEach(response, (artist: any, key: number) => {
    if (artist) {
      const data = artist.data();
      artists[key].image = data.image;
      artists[key].externalURL = data.externalURL;
    }
  });
  return artists;
}

async function getTracks(query: { [key: string]: string; }) {
  const { start, end } = utils.calcRange(query.range, query.start, query.end);
  const tracks = await db.collection('tracks').where('created', '>=', start).where('created', '<=', end).orderBy('created', 'desc').get();
  return tracks.docs.map((track: any) => track.data());
}
