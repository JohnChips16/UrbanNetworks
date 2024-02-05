const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  attachment: String,
  caption: String,
  hashtags: [
    {
      type: String,
      lowercase: true,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});



const postModel = mongoose.model('Post', PostSchema);
module.exports = postModel;
