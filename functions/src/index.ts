import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as dayjs from 'dayjs';
import * as express from 'express';
import * as qs from 'qs';
import axios from 'axios';

admin.initializeApp();

const db = admin.firestore();
const app = express();
const config = admin.remoteConfig();
let SPOTIFYTOKEN: string;
let webHookResponse: functions.Response;
app.use(cors({ origin: true }));

app.post('/webhook', async (request: functions.Request, response: functions.Response) => {
    if (request.body['data']) {
        const data = request.body['data'].toLowerCase();
        webHookResponse = response;
        if (!data.includes(' by ')) return errorHandler('invalid query');
        const dbQuery = await queryExistence(data);
        if (dbQuery) {
            const query = dbQuery[0];
            const duplicate = await queryDuplicateHistory(query.trackId);
            if (!duplicate) {
                return response.send(await saveHistory(query.trackId));
            } else {
                return response.send('Duplicate History Found')
            }
        } else {
            const res = await querySpotify(data);
            if (res) {
                for await (const artist of res.artists) {
                    await saveArtist(artist);
                }
                await saveTrack(res.track, res.artists[0]);
                await saveQuery(res.track.id, data);
                return response.send(await saveHistory(res.track.id));
            }
        }
    } else {
        return response.send(errorHandler('invalid params'));
    }
});

function errorHandler(msg: string) {
    functions.logger.error(msg);
    webHookResponse.status(500).json({ msg })
    throw Error();
}

async function queryExistence(query: string) {
    const data: any[] = [];
    const snapshot = await db.collection('queries').where('query', '==', query).limit(1).get();
    snapshot.forEach(doc => data.push(doc.data()));
    return snapshot.size ? data : false;
}

async function queryDuplicateHistory(trackId: string) {
    const data: any[] = [];
    const snapshot = await db.collection('history').orderBy('date', 'desc').limit(1).get();
    snapshot.forEach(doc => data.push(doc.data()));
    return data[0].trackId === trackId && dayjs(data[0].date.toDate().getTime()).isAfter(dayjs().subtract(5, 'minute'));
}

async function querySpotify(data: string) {
    await getSpotifyToken();
    const [queryTrack, queryArtist] = data.split(' by ', 2);
    const { data: query } = await axios.get('https://api.spotify.com/v1/search', {
        headers: { 'Authorization': `Bearer ${SPOTIFYTOKEN}` },
        params: {
            q: decodeURIComponent(`${queryArtist} ${queryTrack}`),
            type: 'track',
            limit: 1
        }
    });
    if (query.tracks.items.length === 0) return errorHandler('Seach Failure');
    const track = query.tracks.items[0];
    const artists = [];
    for await (const artist of track.artists) {
        if (await checkArtistExists(artist.id)) return;
        const { data: item } = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}`, { headers: { 'Authorization': `Bearer ${SPOTIFYTOKEN}` } });
        artists.push(item);
    }
    return { artists, track };
};

async function getSpotifyToken() {
    const template = await config.getTemplate()
    const username = (template.parameters.SPOTIFYID.defaultValue as any).value;
    const password = (template.parameters.SPOTIFYSECRET.defaultValue as any).value;
    if (!username || !password) return errorHandler('invalid API token');
    const { data: query } = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
        grant_type: 'client_credentials',
    }), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username,
            password,
        }
    });
    SPOTIFYTOKEN = query.access_token;
    return SPOTIFYTOKEN;
}

async function saveHistory(trackId: string) {
    const history = {
        date: new Date(),
        trackId
    };
    await db.collection('history').add(history);
    return history;
}

async function saveQuery(trackId: string, query: string) {
    await db.collection('queries').add({
        trackId,
        query,
        last_updated: new Date()
    });
}

async function checkArtistExists(artistId: string) {
    const snapshot = await db.doc(`artists/${artistId}`).get();
    return snapshot.exists;
}

async function saveArtist(artist: any) {
    await db.doc(`artists/${artist.id}`).set({
        genres: artist.genres,
        id: artist.id,
        image: artist.images[0]?.url,
        name: artist.name,
        url: artist.external_urls?.spotify
    }, { merge: true });
}

async function saveTrack(track: any, artist: any) {
    await db.doc(`tracks/${track.id}`).set({
        album_id: track.album?.id,
        artist_id: artist.id,
        artist_name: artist.name,
        duration: track.duration_ms,
        genres: artist.genres,
        id: track.id,
        image: track.preview_url,
        name: track.name,
        track_number: track.track_number,
        url: track.external_urls?.spotify
    }, { merge: true });

    if (track.album) {
        const album = track.album;
        await db.doc(`albums/${album.id}`).set({
            artist_id: artist.id,
            id: album.id,
            image: album.images[0]?.url,
            name: track.name,
            release_date: new Date(album.release_date),
            total_tracks: album.total_tracks,
            url: album.external_urls?.spotify
        }, { merge: true })
    }
}

exports.endpoints = functions.https.onRequest(app);