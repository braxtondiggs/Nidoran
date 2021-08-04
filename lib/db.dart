import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nidoran/model.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<List<History>> streamHistory() {
    var ref =
        _db.collection('history').limit(100).orderBy('date', descending: true);
    return ref.snapshots().map((list) => list.docs.map((DocumentSnapshot doc) {
          var track = getTrack(doc.get('trackId'));
          return History.fromFirestore(doc, track);
        }).toList());
  }

  Future<Track> getTrack(String id) async {
    return await _db
        .collection('tracks')
        .doc(id)
        .get()
        .then((data) => Track.fromFirestore(data));
  }
}
