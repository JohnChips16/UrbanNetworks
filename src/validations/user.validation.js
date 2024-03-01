const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const addOutlookValidation = {
  body: Joi.object().keys({
    schoolOrUniversity: Joi.string().required(),
    degree: Joi.string().required(),
    specialization: Joi.string(),
    startYear: Joi.number().integer().required(),
    graduatedYear: Joi.number().integer().required(),
  }),
};

const addAboutValidation = {
  body: Joi.object().keys({
    about: Joi.string().required(),
  }),
};

const addAccompOrgValidation = {
  body: Joi.object().keys({
    orgName: Joi.string().required(),
    positionHeld: Joi.string().required(),
    associatedCollegeEtc: Joi.string(),
    current: Joi.boolean().default(false),
    dateFrom: Joi.date().required(),
    dateThen: Joi.date(),
    ongoing: Joi.boolean().default(false),
    description: Joi.string(),
  }),
};


const addAccCertValidation = {
  body: Joi.object().keys({
    CertName: Joi.string().required(),
    CertAuthority: Joi.string().required(),
    LicenseNum: Joi.string(),
    expire: Joi.boolean().default(false),
    dateFrom: Joi.date().required(),
    dateThen: Joi.date(),
    LicenseUrl: Joi.string(),
  }),
};

const addAccLangValidation = {
  body: Joi.object().keys({
    language: Joi.string().required(),
    proficiency: Joi.string().valid(
      'Elementary proficiency',
      'Limited working proficiency',
      'Professional working proficiency',
      'Full professional proficiency',
      'Native or bilingual proficiency'
    ).required(),
  }),
};


const addAccProjValidation = {
  body: Joi.object().keys({
    projectName: Joi.string().required(),
    ongoingProject: Joi.boolean().default(false),
    dateNow: Joi.date().required(),
    dateThen: Joi.date(),
    associateName: Joi.array().items(Joi.string()),
    associateWith: Joi.string(),
    projectUrl: Joi.string(),
    desc: Joi.string(),
  }),
};

const addAccAwrdValidation = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    associatedWith: Joi.string(),
    issuer: Joi.string(),
    date: Joi.date(),
    desc: Joi.string(),
  }),
};



const addAccPubValidation = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    publisher: Joi.string(),
    pubDate: Joi.date(),
    authors: Joi.array().items(Joi.string()),
    pubUrl: Joi.string(),
    desc: Joi.string(),
  }),
};

const externalValidation = {
  body: Joi.object().keys({
    description: Joi.string().required(),
    attachment: Joi.string(),
  }),
};

const userSkillValidation = {
  body: Joi.object().keys({
    skill: Joi.string().required(),
    description: Joi.string().required(),
  }),
};


const addAccTestScoreValidation = {
  body: Joi.object().keys({
    testName: Joi.string().required(),
    associatedWith: Joi.string(),
    score: Joi.number(),
    testDate: Joi.date(),
    desc: Joi.string(),
  }),
};

const addPostValidation = {
  body: Joi.object().keys({
    caption: Joi.string().required(),
  }),
};



const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addAccompOrgValidation,
  addOutlookValidation,
  addAboutValidation,
  addAccCertValidation,
  addAccLangValidation,
  addAccProjValidation,
  addAccPubValidation,
  addAccAwrdValidation,
  addAccTestScoreValidation,
  addPostValidation,
  externalValidation,
  userSkillValidation,
};
