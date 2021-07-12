import 'dart:isolate';
import 'dart:ui';

// ignore: import_of_legacy_library_into_null_safe
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter_notification_listener/flutter_notification_listener.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';
import 'package:nidoran/db.dart';
import 'package:nidoran/model.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      home: NotificationsLog(),
    );
  }
}

class NotificationsLog extends StatefulWidget {
  @override
  _NotificationsLogState createState() => _NotificationsLogState();
}

class _NotificationsLogState extends State<NotificationsLog> {
  final db = DatabaseService();
  var dio = Dio();
  late LocationPermission locationPermission;
  bool locationEnabled = false;
  bool started = false;
  bool _loading = false;

  ReceivePort port = ReceivePort();

  @override
  void initState() {
    initPlatformState();
    super.initState();
  }

  // we must use static method, to handle in background
  static void _callback(NotificationEvent evt) {
    print("send evt to ui: $evt");
    final SendPort? send = IsolateNameServer.lookupPortByName("_listener_");
    if (send == null) print("can't find the sender");
    send?.send(evt);
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initPlatformState() async {
    NotificationsListener.initialize(callbackHandle: _callback);

    // this can fix restart<debug> can't handle error
    IsolateNameServer.removePortNameMapping("_listener_");
    IsolateNameServer.registerPortWithName(port.sendPort, "_listener_");
    port.listen((message) => onData(message));

    locationEnabled = await Geolocator.isLocationServiceEnabled();
    locationPermission = await Geolocator.checkPermission();
    var isR = await NotificationsListener.isRunning;
    print("""Service is ${!isR! ? "not " : ""} already running""");

    setState(() {
      started = isR;
    });
  }

  void requestLocationPermission() async {
    if (locationPermission == LocationPermission.denied ||
        locationPermission == LocationPermission.deniedForever) {
      await Geolocator.requestPermission();
    }
  }

  Future<void> onData(NotificationEvent event) async {
    if (event.packageName == 'com.google.android.as') {
      late Position position;
      var data = {'data': event.title};
      if (locationPermission == LocationPermission.always) {
        position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high);
        data['latlng'] = '${position.latitude},${position.longitude}';
      }
      await dio.post(
          'https://us-central1-nidoran-4f077.cloudfunctions.net/endpoints/webhook',
          data: data);
    }
  }

  void startListening() async {
    print("start listening");
    setState(() {
      _loading = true;
    });
    var hasPermission = await NotificationsListener.hasPermission;
    if (!hasPermission!) {
      print("no permission, so open settings");
      NotificationsListener.openPermissionSettings();
      return;
    }

    var isR = await NotificationsListener.isRunning;

    if (!isR!) {
      await NotificationsListener.startService();
    }

    setState(() {
      started = true;
      _loading = false;
    });
  }

  void stopListening() async {
    print("stop listening");

    setState(() {
      _loading = true;
    });

    await NotificationsListener.stopService();

    setState(() {
      started = false;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Nidoran'),
      ),
      body: Center(
        child: StreamProvider<List<History>>.value(
          value: db.streamHistory(),
          initialData: [],
          child: HistoryList(),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: started ? stopListening : startListening,
        tooltip: 'Start/Stop sensing',
        child: _loading
            ? Icon(Icons.close)
            : (started ? Icon(Icons.stop) : Icon(Icons.play_arrow)),
      ),
    );
  }
}

class HistoryList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var history = Provider.of<List<History>>(context);

    return Container(
      child: ListView(
        children: history.map((item) {
          return FutureBuilder<Track>(
              future: item.track,
              builder: (BuildContext context, AsyncSnapshot<Track> track) {
                String? image = track.data?.image;
                return Card(
                  child: InkWell(
                    onTap: () async {
                      String? url = track.data?.url;
                      if (url != null) {
                        await launch(url);
                      }
                    },
                    child: ListTile(
                      leading: image != null
                          ? new Image.network(image)
                          : FlutterLogo(),
                      title: Text(
                          '${track.data?.name} by ${track.data?.artist_name}'),
                      subtitle: Text(DateFormat.yMEd()
                          .add_jm()
                          .format(item.date.toDate())),
                    ),
                  ),
                );
              });
        }).toList(),
      ),
    );
  }
}
