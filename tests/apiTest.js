'use strict';

// describe('serverHeroku.view module', function () {
//
//   beforeEach(module('serverHeroku.view'));
//
//   describe('view1 controller', function () {
//
//     it('should ....', inject(function ($controller) {
//       //spec body
//       var viewCtrl = $controller('viewCtrl');
//       expect(viewCtrl).toBeDefined();
//     }));
//
//   });
// });

var chakram = require('chakram'),
  expect = chakram.expect;

var libs = process.cwd() + '/libs/';
var User = require(libs + '/model/user'); // get the mongoose model
var Story = require(libs + '/model/story'); // get the mongoose model
var mongoose = require('mongoose');

var mongouri = process.env.MONGO_URI || "mongodb://localhost:27017/spillikin";

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

mongoose.connect(mongouri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function() {
  // Wait for the database connection to establish, then start the app.                         
});


//var URI = "https://spillikin.herokuapp.com/api/";
var URI = "http://localhost:5000/api/";

describe("API tests", function() {
  it("should offer simple HTTP request capabilities", function () {
    return chakram.get(URI).then(function (res) {
      expect(res).to.have.status(200);
      expect(res.body.msg).to.contain("API");
    });
  });
});

describe("Auth tests", function () {

  before(function () {
    User.findOneAndRemove({name:'test'}, function (err) {
      if (err) {
        console.log(err);
      }
    });
    User.findOneAndRemove({name:'test2'}, function (err) {
      if (err) {
        console.log(err);
      }
    });
    User.findOneAndRemove({name:'admin'}, function (err) {
      if (err) {
        console.log(err);
      }
    });
    (new User({ name: "admin", password: "admin", hasAdminRights: true})).save();
  });

  describe ("signup", function () {
    it("should be able to signup", function () {
      return chakram
        .post(URI + "signup", {name: "test", password: "test"})
        .then(function (res1) {
          expect(res1).to.have.status(200);
          return chakram
            .post(URI + "signup", {name: "test", password: "test"});
        })
        .then(function (res2) {
          expect(res2).to.have.status(409);
        });
    })
  });

  describe ("authentication", function () {
    it("should be able to authenticate with right credentials", function () {
      return chakram
        .post(URI + "authenticate", {name: "test", password: "test"})
        .then(function (res1) {
          expect(res1).to.have.status(200);
          expect(res1.body.token).to.match(/^JWT\s+/);
        })
    });

    it("should not be able to authenticate with wrong password", function () {
      return chakram
        .post(URI + "authenticate", {name: "test", password: "test2"})
        .then(function (res1) {
          expect(res1).to.have.status(401);
        })
    });

    it("should not be able to authenticate with wrong username", function () {
      return chakram
        .post(URI + "authenticate", {name: "test2", password: "test2"})
        .then(function (res1) {
          expect(res1).to.have.status(404);
        })
    });
  });

  describe ("authorization", function () {
    it("should be able to get memberinfo with right credentials", function () {
      return chakram
        .post(URI + "authenticate", {name: "test", password: "test"})
        .then(function (res1) {
          expect(res1).to.have.status(200);
          var token = res1.body.token;
          return chakram.get(URI + "memberinfo", {headers:{Authorization:token}});
        })
        .then(function (res3) {
          expect(res3).to.have.status(200);
          expect(res3.body.success).to.be.equal(true);
        });
    });
    //
    // it("should not be able to authenticate with wrong password", function () {
    //   return chakram
    //     .post(URI + "authenticate", {name: "test", password: "test2"})
    //     .then(function (res1) {
    //       expect(res1).to.have.status(401);
    //     })
    // });
    //
    // it("should not be able to authenticate with wrong username", function () {
    //   return chakram
    //     .post(URI + "authenticate", {name: "test2", password: "test2"})
    //     .then(function (res1) {
    //       expect(res1).to.have.status(404);
    //     })
    // });
  });
});

describe("Story tests", function () {

  before(function () {
    Story.findOneAndRemove({name:'test'}, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
  
  var story = {
    name: "test",
    iconUrl: "http://icon.com/12345",
    startingSceneName: "firstScene",
    version: 1,
    resources:[
      {
        platform: 1,
        assetBundles: [
          {url: "http://resources.spillikin.com/123456", version: 1},
          {url: "http://resources.spillikin.com/123457", version: 2}
        ]
      }
    ]
  };

  describe ("creating", function () {

    it("should not be able to create a story w/o permissions", function () {
      return chakram
        .post(URI + "stories", story)
        .then(function (res1) {
          expect(res1).to.have.status(403);
        })
    });

    it("should not be able to create a story w/o admin permissions", function () {
      return chakram
        .post(URI + "authenticate", {name: "test", password: "test"})
        .then(function (res1) {
          expect(res1).to.have.status(200);
          var token = res1.body.token;
          return chakram.post(URI + "stories", story, {headers:{Authorization:token}});
        })
        .then(function (res2) {
          expect(res2).to.have.status(403);
        })
    });

    it("should be able to create a story for admin", function () {
      var token;
      return chakram
        .post(URI + "authenticate", {name: "admin", password: "admin"})
        .then(function (res1) {
          expect(res1).to.have.status(200);
          token = res1.body.token;
          return chakram.post(URI + "stories", story, {headers:{Authorization:token}});
        })
        .then(function (res2) {
          expect(res2).to.have.status(200);
          return chakram.post(URI + "stories", story, {headers:{Authorization:token}});
        })
        .then(function (res3) {
          expect(res3).to.have.status(500);
        });
    });

    it("should be able to get a story", function () {
      return chakram
        .get(URI + "stories")
        .then(function (res1) {
          expect(res1).to.have.status(200);
          expect(res1.body.length).to.at.least(1);
          expect(res1.body.map(function (story) {
            return story.name;
          })).to.contain("test");
        });
    });
  });
});