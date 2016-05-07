/**
 * Created by Yuriy on 08.05.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var StorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  iconUrl: String,
  startingSceneName: {type: String, required: true},
  version: {type: Number, default: 0},
  resources: [
    {
      platform: Number,
      assetBundles: [
        {
          url: String,
          version: {type: Number, default: 0}
        }
      ]
    }
  ]
});

module.exports = mongoose.model('Story', StorySchema);