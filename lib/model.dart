// ignore: import_of_legacy_library_into_null_safe
import 'package:cloud_firestore/cloud_firestore.dart';

class History {
  final String trackId;
  final Timestamp date;
  final Future<Track> track;

  History({required this.trackId, required this.date, required this.track});

  factory History.fromFirestore(DocumentSnapshot doc, Future<Track> track) {
    return History(
      trackId: doc.get('trackId') ?? '',
      date: doc.get('date') ?? Timestamp.now(),
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
    return Track(
        album_id: doc.get('album_id') ?? '',
        artist_id: doc.get('artist_id') ?? '',
        artist_name: doc.get('artist_name') ?? '',
        duration: doc.get('duration') ?? 0,
        id: doc.get('id') ?? '',
        image: doc.get('image') ?? '',
        name: doc.get('name') ?? '',
        track_number: doc.get('track_number') ?? 0,
        url: doc.get('url') ?? '');
  }
}
