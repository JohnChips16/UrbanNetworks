const express = require('express');
const authsc = require('../../middlewares/authsc');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const multer = require('multer');

const path = require('path');

const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');
const rateLimit = require('express-rate-limit');
const {
  addDesc
} = require('../controllers/schoolcontroller')

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
})

const router = express.Router();

router.post('/add/desc',authsc(), addDesc);

module.exports = router;