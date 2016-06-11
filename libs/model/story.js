/**
 * Created by Yuriy on 08.05.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  platform: Number,
  assetBundles: [
    {
      url: String,
      version: {type: Number, default: 0}
    }
  ]
});

// set up a mongoose model
var StorySchema = new Schema({
  name: { type: String, unique: true, required: true },
  iconUrl: String,
  startingSceneName: {type: String, required: true},
  version: {type: Number, default: 0},
  isFree: {type: Boolean, default: false},
  resources: [ResourceSchema]
});

StorySchema.statics.findByName = function findByName (name, cb) {
  return this.findOne({name: name}, cb);
};

StorySchema.statics.findByNameAndRemove = function findByName (name, cb) {
  return this.findOneAndRemove({name: name}, cb);
};

module.exports = mongoose.model('Story', StorySchema);