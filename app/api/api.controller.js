'use strict';
const _ = require('lodash');
const humanizeDuration = require('humanize-duration');

module.exports.totalDuration = function(data) {
  return new Promise(resolve => {
    const duration = _
      .chain(data)
      .map('duration')
      .sum()
      .value();
    resolve({
      value: duration,
      formatted: humanizeDuration(duration)
    });
  });
};

module.exports.topArtists = function(data) {
  return new Promise(resolve => {
    resolve(_
      .chain(data)
      .map('artist')
      .flatten()
      .map((o, key, artists) => ({
        name: o,
        count: _.size(artists.filter(value => _.isEqual(value, o)))
      }))
      .uniqBy('name')
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value());
  });
};

module.exports.topGenres = function(data) {
  return new Promise(resolve => {
    resolve(_
      .chain(data)
      .map('genres')
      .flatten()
      .map((o, key, genres) => ({
        name: o,
        count: _.size(genres.filter(value => _.isEqual(value, o)))
      }))
      .uniqBy('name')
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value());
  });
};

module.exports.topTracks = function(data) {
  return new Promise(resolve => {
    resolve(_
      .chain(data)
      .groupBy('id')
      .map(items => (items[0].count = items.length, _.omit(items[0], ['_id', 'id', 'query']))) // eslint-disable-line no-return-assign, no-sequences
      .orderBy('count', 'desc')
      .slice(0, 10)
      .value());
  });
};
