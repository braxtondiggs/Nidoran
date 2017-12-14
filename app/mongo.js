'use strict';

const MongoClient = require('mongodb').MongoClient;
const Utils = require('./utils.js');
const _ = require('lodash');
module.exports.save = function(track) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (!err && !_.isEmpty(track)) {
        isNotLast(db, track).then(status => {
          if (status) {
            db.collection('Tracks').insert(track, (err, result) => {
              db.close();
              if (err) return reject(err);
              return resolve(result);
            });
          } else {
            db.close();
            return resolve('Duplicate');
          }
        });
      } else {
        db.close();
        return reject(err);
      }
    });
  });
};

module.exports.get = function(range, start, end) {
  return new Promise((resolve, reject) => {
    const params = ['yesterday', 'last7days', 'last14days', 'last30days', 'thisweek', 'lastweek', 'thismonth', 'lastmonth', 'customrange'];
    range = _.indexOf(params, range) !== -1 ? range : 'thismonth';
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (!err) {
        let date = Utils.calcRange(range, start, end);
        db.collection('Tracks').find({
          created: {
            $gte: date.start,
            $lte: date.end
          }
        }, (err, cursor) => {
          if (err) return reject(err);
          cursor.toArray(function(err, items) {
            if (err) return reject(err);
            db.close();
            resolve(items);
          });
        });
      } else {
        db.close();
        return reject(err);
      }
    });
  });
};

function isNotLast(db, track) {
  return new Promise((resolve, reject) => {
    db.collection('Tracks').find().sort({
      $natural: -1
    }).limit(1).toArray((err, result) => {
      if (err) return reject();
      return resolve(_.first(result).id !== track.id);
    });
  });
}
