var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var MongoDB = require('./app/mongo.js');
app.use(bodyParser.json());
app.use(cors());
app.get('/', function(req, res) {});
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('App now running on port', port);
});
