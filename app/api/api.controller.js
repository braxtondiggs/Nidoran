'use strict';
const _ = require('lodash');

module.exports.totalDuration = function(data) {
  return new Promise(resolve => {
    resolve(_
      .chain(data)
      .map('duration')
      .sum()
      .value());
  });
};

module.exports.topArtists = function(data) {
  return new Promise(resolve => {
    resolve(_
      .chain(data)
      .map('artist')
      .flatten()
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
