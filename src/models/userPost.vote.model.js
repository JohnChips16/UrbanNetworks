const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostVoteSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  votes: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
});

const PostVoteModel = mongoose.model('PostVote', PostVoteSchema);

module.exports = PostVoteModel;