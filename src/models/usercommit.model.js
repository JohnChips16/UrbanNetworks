const mongoose = require('mongoose');

const schoolCommitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  attachment: String,
  link: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const SchoolCommit = mongoose.model('SchoolCommit', schoolCommitSchema);

module.exports = SchoolCommit;
