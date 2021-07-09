// ignore: import_of_legacy_library_into_null_safe
import 'package:cloud_firestore/cloud_firestore.dart';

class History {
  final String trackId;
  final Timestamp date;
  final Future<Track> track;

  History({required this.trackId, required this.date, required this.track});

  factory History.fromFirestore(DocumentSnapshot doc, Future<Track> track) {
    Map data = doc.data;

    return History(
      trackId: data['trackId'] ?? '',
      date: data['date'] ?? Timestamp.now(),
      track: track,
    );
  }
}

class Track {
  final String album_id;
  final String artist_id;
  final String artist_name;
  final int duration;
  final String id;
  final String image;
  final String name;
  final int track_number;
  final String url;

  Track(
      {required this.artist_id,
      required this.artist_name,
      required this.duration,
      required this.id,
      required this.image,
      required this.name,
      required this.track_number,
      required this.url,
      required this.album_id});

  factory Track.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data;
    return Track(
        album_id: data['album_id'] ?? '',
        artist_id: data['artist_id'] ?? '',
        artist_name: data['artist_name'] ?? '',
        duration: data['duration'] ?? 0,
        id: data['id'] ?? '',
        image: data['image'] ?? '',
        name: data['name'] ?? '',
        track_number: data['track_number'] ?? 0,
        url: data['url'] ?? '');
  }
}
