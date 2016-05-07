var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var libs = process.cwd() + '/libs/';

var appdomain =  process.env.APP_DOMAIN || "thespillikin.com";
var appsecret =  process.env.APP_SECRET || "thespillikin.com";

var User = require(libs + '/model/user'); // get the mongoose model

module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = appsecret;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.issuer =  appdomain;
  opts.audience = appdomain;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
          if (err) {
              return done(err, false);
          }
          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
      });
  }));
};
