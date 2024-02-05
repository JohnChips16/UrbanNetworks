const mongoose = require('mongoose');

const accLangSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
  },
  proficiency: {
    type: String,
    enum: [
      'Elementary proficiency',
      'Limited working proficiency',
      'Professional working proficiency',
      'Full professional proficiency',
      'Native or bilingual proficiency',
    ],
    required: true,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const AccLang = mongoose.model('AccLang', accLangSchema);

module.exports = AccLang;
