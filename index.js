var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');
var libs = process.cwd() + '/libs/';

var api = require(libs + './routes/api');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('mongouri', (process.env.MONGO_URI || "mongodb://localhost:27017/spillikin"));
app.set('appdomain', (process.env.APP_DOMAIN || "thespillikin.com"));
app.set('appsecret', (process.env.APP_SECRET || "thespillikin.com"));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());

//app.use('/', api);
app.use('/api', api);

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


