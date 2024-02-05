const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('./rolerightsc');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, school, info) => {
  if (err || !school) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, `Please authenticate, err: ${err}, info: ${info}`));
  }
  
  req.school = school;

  if (requiredRights.length > 0) {
    const schoolRights = roleRights.get(school.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => schoolRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.schoolId !== school.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};


const authsc = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = authsc;
