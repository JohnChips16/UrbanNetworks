const mongoose = require('mongoose');

const accTestScoreSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
  },
  associatedWith: {
    type: String,
  },
  score: {
    type: Number,
  },
  testDate: {
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

const AccTestScore = mongoose.model('AccTestScore', accTestScoreSchema);

module.exports = AccTestScore;
