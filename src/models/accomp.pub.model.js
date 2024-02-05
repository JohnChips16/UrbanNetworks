const mongoose = require('mongoose');

const accPubSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
  },
  pubDate: {
    type: Date,
  },
  authors: {
    type: [String],
    default: [],
  },
  pubUrl: {
    type: String,
  },
  desc: {
    type: String,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const AccPub = mongoose.model('AccPub', accPubSchema);

module.exports = AccPub;
