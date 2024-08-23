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
    type: Date,
    default: Date.now,
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

// Create indexes for all fields
for (const path in userNewsSchema.paths) {
  const field = userNewsSchema.paths[path];
  if (field.instance === 'String') {
    userNewsSchema.index({ [path]: 'text' });
  } else if (field.instance === 'Date') {
    userNewsSchema.index({ [path]: 1 });
  } else if (field.instance === 'ObjectId') {
    userNewsSchema.index({ [path]: 1 });
  }
}

const UserNews = mongoose.model('UserNews', userNewsSchema);

module.exports = UserNews;