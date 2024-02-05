const mongoose = require('mongoose');

const accCertSchema = new mongoose.Schema({
  CertName: {
    type: String,
    required: true,
  },
  CertAuthority: {
    type: String,
    required: true,
  },
  LicenseNum: {
    type: String,
  },
  expire: {
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
  LicenseUrl: {
    type: String,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

accCertSchema.pre('save', function (next) {
  if (this.expire) {
    this.dateThen = new Date();
  }
  next();
});

const AccCert = mongoose.model('AccCert', accCertSchema);

module.exports = AccCert;
