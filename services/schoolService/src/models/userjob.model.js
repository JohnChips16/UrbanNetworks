const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
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
    required: false
  },
  numEmployee: {
    type: String,
    required: false
  },
  typeofJob: {
    type: String,
    required: false
  },
  urlApply: {
    type: String,
    required: false
  },
  skillReq: {
    type: [String],
    required: false
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
