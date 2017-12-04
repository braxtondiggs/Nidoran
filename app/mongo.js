const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
module.exports.save = function(track) {
  return new Promise(function(resolve, reject) {
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
