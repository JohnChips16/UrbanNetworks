const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const PhoneNumber = require('libphonenumber-js');

const userSchema = mongoose.Schema(
  {
    schoolOrUniversityName: {
      type: String,
      // required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    fullname: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Validate that the phone number contains only numeric characters
          return /^\d+$/.test(value);
        },
        message: 'Invalid phone number, must contain only numeric characters',
      },
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
    type: String,
    maxlength: 65,
  },
  avatarPic: String,
  backgroundPic: String,
    about: {
      type: String,
    },
    mailbox: {
      inbox: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
      outbox: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
      drafts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
      trash: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);



// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.index({ schoolOrUniversityName: 'text', username: 'text', fullname: 'text' });
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};


/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
 
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
