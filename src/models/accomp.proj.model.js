const mongoose = require('mongoose');

const accProjSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  ongoingProject: {
    type: Boolean,
    default: false,
  },
  dateNow: {
    type: Date,
    required: true,
  },
  dateThen: {
    type: Date,
  },
  associateName: {
    type: [String],
    default: [],
  },
  associateWith: {
    type: String,
  },
  projectUrl: {
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

accProjSchema.pre('save', function (next) {
  if (this.ongoingProject) {
    this.dateThen = new Date();
  }
  next();
});

const AccProj = mongoose.model('AccProj', accProjSchema);

module.exports = AccProj;
