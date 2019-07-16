import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const app = express();
app.use(cors({ origin: true }));

app.get('/lastTrack', async (request, response) => {
  const lastTrack = await admin.firestore().collection('Track').orderBy('created', 'desc').limit(1).get();
  await lastTrack.forEach(async (doc: any) => response.send(doc.data()));
});

export const listener = functions.https.onRequest(app);
