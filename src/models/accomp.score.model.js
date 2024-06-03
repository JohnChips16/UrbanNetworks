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

// Create indexes for all string fields
for (const path in accTestScoreSchema.paths) {
  const field = accTestScoreSchema.paths[path];
  if (field.instance === 'String') {
    accTestScoreSchema.index({ [path]: 'text' });
  }
}

const AccTestScore = mongoose.model('AccTestScore', accTestScoreSchema);

module.exports = AccTestScore;