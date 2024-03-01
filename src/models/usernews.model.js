const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userNewsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  attachment: {
    type: String,
  },
  url: {
    type: String,
  },
  datePosted: {
    type: String,
    required: true
  },
  caption: String,
  hashtags: [
    {
      type: String,
      lowercase: true,
    },
  ],
  author: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

const UserNews = mongoose.model('UserNews', userNewsSchema);

module.exports = UserNews;
