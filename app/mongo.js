'use strict';

const MongoClient = require('mongodb').MongoClient;
const Utils = require('./utils.js');
const _ = require('lodash');
module.exports.save = function(track, artist) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (err || _.isEmpty(track)) {
        db.close();
        return reject(err);
      }
      isNotLast(track).then(status => {
        if (status) {
          Promise.all([
            db.collection('Tracks').insert(track, (err, result) => err ? reject(err) : resolve(result)),
            db.collection('Artist').updateOne({
              id: artist.id
            }, artist, {
              upsert: true
            }, (err, result) => err ? reject(err) : resolve(result))
          ]).then(result => resolve(result)).catch(err => reject(err));
        } else {
          db.close();
          return resolve('Duplicate');
        }
      });
    });
  });
};

module.exports.get = function(range, start, end) {
  return new Promise((resolve, reject) => {
    const params = ['yesterday', 'last7days', 'last14days', 'last30days', 'thisweek', 'lastweek', 'thismonth', 'lastmonth', 'customrange'];
    range = _.indexOf(params, range) !== -1 ? range : 'thismonth';
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (err) {
        db.close();
        return reject(err);
      }
      let date = Utils.calcRange(range, start, end);
      db.collection('Tracks').find({
        created: {
          $gte: date.start,
          $lte: date.end
        }
      }, (err, cursor) => {
        if (err) return reject(err);
        cursor.toArray(function(err, items) {
          db.close();
          if (err) return reject(err);
          resolve(items);
        });
      });
    });
  });
};

module.exports.last = async function() {
  const db = await MongoClient.connect(process.env.MONGODB_URI);
  return await db.collection('Tracks').find().sort({
    $natural: -1
  }).limit(1).toArray();
};

module.exports.getArtistImage = function(artist) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (err) {
        db.close();
        return reject(err);
      }
      db.collection('Artist').findOne({ name: artist }, (err, document) => {
        db.close();
        if (err) return reject(err);
        return resolve(document);
      });
    });
  });
};

function isNotLast(track) {
  return new Promise((resolve, reject) => {
    exports.last().then(result => resolve(_.first(result).id !== track.id)).catch(err => reject(err));
  });
}
