'use strict';
import { Router } from 'express';
import { check } from 'express-validator/check';
import { Utils } from '../../utils';
import WebHookController from './webhook.controller';

export class WebHookRouter {
  public router: Router;
  public utils: Utils;

  constructor() {
    this.router = Router();
    this.utils = new Utils();
    this.webhook();
  }
  private webhook() {
    this.router.post('/', [
      check('data').exists().trim()
    ], WebHookController.index.bind(this));
  }
}

export default new WebHookRouter().router;
