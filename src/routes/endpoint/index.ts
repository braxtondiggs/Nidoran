'use strict';
import { Router } from 'express';
import { check } from 'express-validator/check';
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
    this.index();
  }

  private totalDuration() {
    this.router.get('/totalDuration', [check(['range', 'start', 'end'])],
      EndpointController.totalDuration.bind(EndpointController));
  }

  private topArtists() {
    this.router.get('/topArtists', [check(['range', 'start', 'end'])],
      EndpointController.topArtists.bind(EndpointController));
  }

  private topGenres() {
    this.router.get('/topGenres', [check(['range', 'start', 'end'])],
      EndpointController.topGenres.bind(EndpointController));
  }

  private topTracks() {
    this.router.get('/topTracks', [check(['range', 'start', 'end'])],
      EndpointController.topTracks.bind(EndpointController));
  }

  private lastTrack() {
    this.router.get('/lastTrack', [check(['range', 'start', 'end'])],
      EndpointController.lastTrack.bind(EndpointController));
  }

  private index() {
    this.router.get('/', [check(['range', 'start', 'end'])],
      EndpointController.all.bind(EndpointController));
  }
}

export default new EndpointRouter().router;
