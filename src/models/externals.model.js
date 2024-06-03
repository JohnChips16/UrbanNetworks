const mongoose = require('mongoose');

const externalSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  attachment: {
    type: String, // Assuming you store file paths or URLs for attachments
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Create indexes for all string fields
for (const path in externalSchema.paths) {
  const field = externalSchema.paths[path];
  if (field.instance === 'String') {
    externalSchema.index({ [path]: 'text' });
  }
}

const External = mongoose.model('External', externalSchema);

module.exports = External;