'use strict';

const express = require('express');
const MongoDB = require('../mongo.js');
const APIEndPoint = require('./api.controller');
const router = express.Router();

router.get('/totalDuration', (req, res, next) => {
  MongoDB.get(req.query.range, req.query.start, req.query.end).then(data => {
    APIEndPoint.totalDuration(data).then(response => {
      res.json(response);
    }).catch(err => next(err));
  }).catch(err => next(err));
});

router.get('/topArtists', (req, res, next) => {
  MongoDB.get(req.query.range, req.query.start, req.query.end).then(data => {
    APIEndPoint.topArtists(data).then(response => {
      res.json(response);
    }).catch(err => next(err));
  }).catch(err => next(err));
});

router.get('/topTracks', (req, res, next) => {
  MongoDB.get(req.query.range, req.query.start, req.query.end).then(data => {
    APIEndPoint.topTracks(data).then(response => {
      res.json(response);
    }).catch(err => next(err));
  }).catch(err => next(err));
});

module.exports = router;
