import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as WebHook from './webhook';
import * as EndPoint from './endpoint';

admin.initializeApp(functions.config().firebase);

export const webhook = WebHook.listener;
export const endpoint = EndPoint.listener;
