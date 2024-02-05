const mongoose = require('mongoose');

const accAwrdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  associatedWith: {
    type: String,
  },
  issuer: {
    type: String,
  },
  date: {
    type: Date,
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

const AccAwrd = mongoose.model('AccAwrd', accAwrdSchema);

module.exports = AccAwrd;
