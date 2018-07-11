'use strict';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator/filter';
import { Utils } from '../../utils';
import { EndpointService } from './endpoint.service';

export class EndpointController {
  private utils: Utils = new Utils();
  private service: EndpointService = new EndpointService();

  public async totalDuration(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    res.json(await this.service.totalDuration(query.range, query.start, query.end));
  }

  public async topArtists(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    res.json(await this.service.topArtists(query.range, query.start, query.end));
  }

  public async topGenres(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    res.json(await this.service.topGenres(query.range, query.start, query.end));
  }

  public async topTracks(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    res.json(await this.service.topTracks(query.range, query.start, query.end));
  }

  public async lastTrack(req: Request, res: Response) {
    res.json(await this.utils.getLastTrack());
  }

  public async all(req: Request, res: Response) {
    const query: any = matchedData(req, { locations: ['query'] });
    res.json({
      artists: await this.service.topArtists(query.range, query.start, query.end),
      duration: await this.service.totalDuration(query.range, query.start, query.end),
      genres: await this.service.topGenres(query.range, query.start, query.end),
      last: await this.utils.getLastTrack(),
      tracks: await this.service.topTracks(query.range, query.start, query.end)
    });
  }
}

export default new EndpointController();
