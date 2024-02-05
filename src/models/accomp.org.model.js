const mongoose = require('mongoose');

const accompOrgSchema = new mongoose.Schema({
  orgName: {
    type: String,
    required: true,
  },
  positionHeld: {
    type: String,
    required: true,
  },
  associatedCollegeEtc: {
    type: String,
  },
  current: {
    type: Boolean,
    default: false,
  },
  dateFrom: {
    type: Date,
    required: true,
  },
  dateThen: {
    type: Date,
  },
  ongoing: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

accompOrgSchema.pre('save', function (next) {
  if (this.ongoing) {
    this.dateThen = new Date();
  }
  next();
});

const AccompOrg = mongoose.model('AccompOrg', accompOrgSchema);

module.exports = AccompOrg;
