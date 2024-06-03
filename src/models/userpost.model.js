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

// Create indexes for all fields
for (const path in PostSchema.paths) {
  const field = PostSchema.paths[path];
  if (field.instance === 'String') {
    PostSchema.index({ [path]: 'text' });
  } else if (field.instance === 'Date') {
    PostSchema.index({ [path]: 1 });
  } else if (field.instance === 'ObjectId') {
    PostSchema.index({ [path]: 1 });
  }
}

const postModel = mongoose.model('Post', PostSchema);
module.exports = postModel;