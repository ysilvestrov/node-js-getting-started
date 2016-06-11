var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');

var libs = process.cwd() + '/libs/';
var User = require(libs + '/model/user'); // get the mongoose model
var Story = require(libs + '/model/story'); // get the mongoose model

var router = express.Router();
var mongouri = process.env.MONGO_URI || "mongodb://localhost:27017/spillikin";
var secret = process.env.SECRET || "TheSpillikin2016";

mongoose.connect(mongouri);

require(libs + '/auth/passport')(passport);


/* GET users listing. */
router.get('/', function (req, res) {
  res.json({
    msg: 'API is running'
  });
});

router.post('/signup', function (req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    newUser.save(function (err) {
      if (err) {
        res.status(409).json({success: false, msg: 'Username already exists.', error: err});
      } else {
        res.json({success: true, msg: 'Successful created user!'});
      }
    });
  }
});

router.post('/authenticate', function (req, res) {
  User.findOne({
    name: req.body.name
  }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(404).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.encode(user, secret);
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

router.get('/memberinfo', function (req, res) {
  checkUserToken(req, res, function (req, res, user) {
    return res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
  });
});

fail = function (res, status, message) {
  return res.status(status).send({success: false, msg: message});
}

success = function (res, message) {
  return res.send({success: true, msg: message});
}

checkUserToken = function (req, res, cb) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, secret);
    User.findByName(decoded.name, function (err, user) {
      if (err) throw err;

      if (!user) {
        return fail(res, 403, 'Authentication failed. User not found.');
      } else {
        cb(req, res, user);
      }
    });
  } else {
    return fail(res, 403, 'No token provided.');
  }
}

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

router.route('/stories')
  .post(function (req, res) {
    checkUserToken(req, res, function (req, res, user) {
      if (!user.isAdmin())
        return fail(res, 403, "Forbidden");

      var story = new Story();

      story.name = req.body.name;
      story.iconUrl = req.body.iconUrl;
      story.startingSceneName = req.body.startingSceneName;
      story.version = req.body.version;
      story.resources = req.body.resources;

      story.save(function (err) {
        if (err)
          return fail(res, 500, 'Cannot create story');
        else
          return success(res, 'Successful created story!');
      });
    });
  })
  .get(function (req, res) {

    Story.find(function (err, stories) {
      if (err) {
        res.json({success: false, msg: 'Cannot get stories', error: err});
      }

      res.json(stories);
    });
  });

router.route('/stories/:name')
  .get(function (req, res) {

    Story.findByName(req.params.storyId, function (err, story) {
      if (err) {
        fail(res, 404, 'Cannot get story');
      }

      res.json(story);
    });
  })
  .put(function (req, res) {
    checkUserToken(req, res, function (req, res, user) {
      if (!user.isAdmin())
        return fail(res, 403, "Forbidden");
      Story.findByName(req.params.name, function (err, story) {
        if (err) {
          res.json({success: false, msg: 'Cannot get story', error: err});
        }

        story.name = req.body.name;
        story.iconUrl = req.body.iconUrl;
        story.startingSceneName = req.body.startingSceneName;
        story.version = req.body.version;
        story.resources = req.body.resources;

        story.save(function (err) {
          if (err)
            fail(res, 500, 'Cannot update story');

          success(res, 'Successful updated story!');
        });
      });
    });
  })
  .delete(function (req, res) {
    checkUserToken(req, res, function (req, res, user) {
      if (!user.isAdmin())
        return fail(res, 403, "Forbidden");
      Story.findByNameAndRemove(req.params.name, function (err, story) {
        if (err) {
          res.json({success: false, msg: 'Cannot delete story', error: err});
        }

        res.json(story);
      });
    });
  });

module.exports = router;
