'use strict';

module.exports.topArtist = function(data) {
  return new Promise((resolve, reject) => {
    resolve({
      status: 'new',
      data
    });
  });
};
