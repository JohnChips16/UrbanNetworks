const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const UserSkill = mongoose.model('UserSkill', userSkillSchema);

module.exports = UserSkill;
