const httpStatus = require('http-status');
// const { School, Education, AccompOrg, AccCert, AccLang, AccAwrd, AccProj, AccPub, AccTestScore, Post, Following, Followers, Notification, PostVote, Experience, Externals } = require('../models');
const { School } = require('../../models')
const ApiError = require('../../utils/ApiError');
const socketHandler = require('../../handlers/socketHandler');
const fs = require('fs');
const { ObjectID } = require('mongodb');

const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
// const { retrieveComments, populatePostsPipeline } = require('../utils/controllerUtils')


 const createSchool = async (SchoolBody) => {
  if (await School.isEmailTaken(SchoolBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  } else if (await School.isPhoneTaken(SchoolBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  } else {
    return School.create(SchoolBody);
  }
};


module.exports = {
  createSchool,
  }