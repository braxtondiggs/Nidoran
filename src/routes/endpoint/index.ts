'use strict';
import { Router } from 'express';
import { Utils } from '../../utils';
import EndpointController from './endpoint.controller';

export class EndpointRouter {
  public router: Router;
  public utils: Utils;

  constructor() {
    this.router = Router();
    this.utils = new Utils();
    this.totalDuration();
    this.topArtists();
    this.topGenres();
    this.topTracks();
    this.lastTrack();
  }

  private totalDuration() {
    this.router.get('/totalDuration', [], EndpointController.totalDuration.bind(this));
  }

  private topArtists() {
    this.router.get('/topArtists', [], EndpointController.topArtists.bind(this));
  }

  private topGenres() {
    this.router.get('/topGenres', [], EndpointController.topGenres.bind(this));
  }

  private topTracks() {
    this.router.get('/topTracks', [], EndpointController.topTracks.bind(this));
  }

  private lastTrack() {
    this.router.get('/lastTrack', [], EndpointController.lastTrack.bind(this));
  }
}

export default new EndpointRouter().router;
