const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  schoolOrUniversity: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
  },
  startYear: {
    type: String,
    required: true,
  },
  graduatedYear: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
});

const Education = mongoose.model('Education', educationSchema);

module.exports = Education;
