const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userEventSchema = new Schema({
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
    default: Date.now
  },
  eventDate: {
    type: String,
    required: true
  },
  eventHour: {
    type: String,
    required: true
  },
  locationOrPlatform: {
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

// Create indexes for all fields
for (const path in userEventSchema.paths) {
  const field = userEventSchema.paths[path];
  if (field.instance === 'String') {
    userEventSchema.index({ [path]: 'text' });
  } else if (field.instance === 'Date') {
    userEventSchema.index({ [path]: 1 });
  } else if (field.instance === 'ObjectId') {
    userEventSchema.index({ [path]: 1 });
  }
}

const UserEvent = mongoose.model('UserEvent', userEventSchema);

module.exports = UserEvent;