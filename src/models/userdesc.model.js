const mongoose = require('mongoose');

const schoolDescSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  typeOfIndustry: String,
  companySize: String,
  mainLocation: String,
  typeofOrg: String,
  specialities: [String],
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const SchoolDesc = mongoose.model('SchoolDesc', schoolDescSchema);

module.exports = SchoolDesc;
