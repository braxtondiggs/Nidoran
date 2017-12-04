const MongoClient = require('mongodb').MongoClient;
const Utils = require('./utils.js');
const _ = require('lodash');
module.exports.save = function(track) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (!err && !_.isEmpty(track)) {
        db.collection('Tracks').insert(track, (err, result) => {
          db.close();
          if (err) return reject(err);
          return resolve(result);
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
