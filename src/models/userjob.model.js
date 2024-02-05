const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  attachment: {
    type: String,
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  jobReq: {
    type: String,
    required: true
  },
  numEmployee: {
    type: String,
    required: true
  },
  typeofJob: {
    type: String,
    required: true
  },
  urlApply: {
    type: String,
    required: true
  },
  skillReq: {
    type: [String],
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

const UserJob = mongoose.model('UserJob', userJobSchema);

module.exports = UserJob;
