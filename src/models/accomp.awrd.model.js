const mongoose = require('mongoose');

const accAwrdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  associatedWith: {
    type: String,
  },
  issuer: {
    type: String,
  },
  date: {
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

// Define text index on title, associatedWith, issuer, and desc fields
for (const path in accAwrdSchema.paths) {
  const field = accAwrdSchema.paths[path];
  if (field.instance === 'String') {
    accAwrdSchema.index({ [path]: 'text' });
  }
}


const AccAwrd = mongoose.model('AccAwrd', accAwrdSchema);

module.exports = AccAwrd;