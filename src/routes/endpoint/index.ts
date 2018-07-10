'use strict';
import { Router } from 'express';
import EndpointController from './endpoint.controller';

export class EndpointRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.totalDuration();
    this.topArtists();
    this.topGenres();
    this.topTracks();
    this.lastTrack();
  }

  private totalDuration() {
    this.router.get('/totalDuration', [], EndpointController.totalDuration.bind(EndpointController));
  }

  private topArtists() {
    this.router.get('/topArtists', [], EndpointController.topArtists.bind(EndpointController));
  }

  private topGenres() {
    this.router.get('/topGenres', [], EndpointController.topGenres.bind(EndpointController));
  }

  private topTracks() {
    this.router.get('/topTracks', [], EndpointController.topTracks.bind(EndpointController));
  }

  private lastTrack() {
    this.router.get('/lastTrack', [], EndpointController.lastTrack.bind(EndpointController));
  }
}

export default new EndpointRouter().router;
