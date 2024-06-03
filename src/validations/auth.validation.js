const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    phone: Joi.string().required(),
    location: Joi.string().allow(''), 
    role: Joi.string().required(),
    about: Joi.string().required(),
  }),
};


const registerschool = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    schoolOrUniversityName: Joi.string().required(),
    username: Joi.string().required(),
    role: Joi.string().required(),
    /*adding identifier*/
    phone: Joi.string().required(),
    location: Joi.string().allow(''), // You can adjust validation rules as needed
    about: Joi.string().required(),
  }),
};


const login = {
  body: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  registerschool
};
