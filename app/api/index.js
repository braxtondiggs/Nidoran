'use strict';

const express = require('express');
const MongoDB = require('../mongo.js');
const APIEndPoint = require('./api.controller');
const router = express.Router();

router.get('/topArtist', (req, res, next) => {
  MongoDB.get(req.query.range, req.query.start, req.query.end).then(data => {
    APIEndPoint.topArtist(data).then(response => {
      res.json(response);
    }).catch(err => next(err));
  }).catch(err => next(err));
});

module.exports = router;
