// ignore: import_of_legacy_library_into_null_safe
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nidoran/model.dart';

class DatabaseService {
  final Firestore _db = Firestore.instance;

  Stream<List<History>> streamHistory() {
    var ref =
        _db.collection('history').limit(100).orderBy('date', descending: true);
    return ref.snapshots().map((list) => list.documents.map((doc) {
          var track = getTrack(doc.data['trackId']);
          return History.fromFirestore(doc, track);
        }).toList());
  }

  Future<Track> getTrack(String id) async {
    return await _db
        .collection('tracks')
        .document(id)
        .get()
        .then((data) => Track.fromFirestore(data));
  }
}
