var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var libs = process.cwd() + '/libs/';

var api = require(libs + './routes/api');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('mongouri', (process.env.MONGO_URI || "mongodb://localhost:27017/spillikin"));
app.set('appdomain', (process.env.APP_DOMAIN || "thespillikin.com"));
app.set('appsecret', (process.env.APP_SECRET || "thespillikin.com"));

var mongouri = process.env.MONGO_URI || "mongodb://localhost:27017/spillikin";
var options = {
  server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
  replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
};

mongoose.connect(mongouri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {
  // Wait for the database connection to establish, then start the app.

  app.use(express.static(__dirname + '/public'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(methodOverride());

//app.use('/', api);
  app.use('/api', api);

// views is directory for all template files
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.get('/', function (request, response) {
    response.render('pages/index');
  });

  app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
  });

});

