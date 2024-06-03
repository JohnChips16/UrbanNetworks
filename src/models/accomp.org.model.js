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
    type: String,
    required: true,
  },
  dateThen: {
    type: String,
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

// Define text index on orgName field
for (const path in accompOrgSchema.paths) {
  const field = accompOrgSchema.paths[path];
  if (field.instance === 'String') {
    accompOrgSchema.index({ [path]: 'text' });
  }
}


const AccompOrg = mongoose.model('AccompOrg', accompOrgSchema);

module.exports = AccompOrg;