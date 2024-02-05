const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const {
  addDesc,
  addCommit
} = require('../controllers/user.controller')


const {
  createPost,
  retrievePost,
  deletePost,
  retrievePostFeed,
  retrieveSuggestedPosts,
  retrieveHashtagPosts,
} = require('../controllers/post.controller.js');

const {
  createJob,
  retrievejob,
  deleteJob,
  retrieveJobFeed,
  retrieveSuggestedJobs,
  retrieveHashtagJobs,
} = require('../controllers/job.controller.js');

const {
  createEvent,
  retrieveEvent,
  deleteEvent,
  retrieveEventFeed,
  retrieveSuggestedEvents,
  retrieveHashtagEvents,
} = require('../controllers/event.controller.js');

const {
  retrieveUser,
  retrievePosts,
  retrieveJobs,
  retrieveDescriptions,
  retrieveEvents,
  retrieveCommits,
  followUser,
  retrieveFollowing,
  retrieveFollowers,
  searchUsers,
  confirmUser,
  changeAvatar,
  removeAvatar,
  changeBackground,
  removeBackground,
  updateProfile,
  retrieveSuggestedUsers,
} = require('../controllers/user.controller');


const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');
const rateLimit = require('express-rate-limit');
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);


router.post('/add/description', auth(), addDesc)
router.post('/add/commit', postLimiter, auth(), upload, addCommit);

{/*post section*/}


router.post('/post', postLimiter, auth(), upload, createPost);

router.get('/post/:postId', retrievePost);
router.get('/post/feed/:offset', auth(), retrievePostFeed);
router.get('/post/hashtag/:hashtag/:offset', auth(), retrieveHashtagPosts);
router.delete('/post/:postId', auth(), deletePost);

{/*job section*/}

router.post('/job', postLimiter, auth(), upload, createJob);
router.get('/job/:jobId', retrievejob);
router.get('/job/feed/:offset', auth(), retrieveJobFeed);
router.get('/job/hashtag/:hashtag/:offset', auth(), retrieveHashtagJobs);
router.delete('/job/:jobId', auth(), deleteJob);

{/*Event section*/}

router.post('/event', postLimiter, auth(), upload, createEvent);
router.get('/event/:eventId', retrieveEvent);
router.get('/event/feed/:offset', auth(), retrieveEventFeed);
router.get('/event/hashtag/:hashtag/:offset', auth(), retrieveHashtagEvents);
router.delete('/event/:eventId', auth(), deleteEvent);

{/*user section*/}

  router.get('/suggested/:max?', auth(), retrieveSuggestedUsers);
router.get('/school/:schoolOrUniversityName', retrieveUser);
router.get('/:schoolOrUniversityName/posts/:offset', retrievePosts);
router.get('/:schoolOrUniversityName/jobs/:offset', retrieveJobs);
router.get('/:schoolOrUniversityName/events/:offset', retrieveEvents);
router.get('/:schoolOrUniversityName/descriptions/:offset', retrieveDescriptions);
router.get('/:schoolOrUniversityName/commits/:offset', retrieveCommits);
router.get('/:userId/:offset/following', auth(), retrieveFollowing);
router.get('/:userId/:offset/followers', auth(), retrieveFollowers);
router.get('/:username/:offset/search', searchUsers);
router.put(
  '/avatar',
  auth(),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  changeAvatar
);
router.put('/', auth(), updateProfile);

router.delete('/avatar', auth(), removeAvatar);

router.put(
  '/background',
  auth(),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  changeBackground
);
router.delete('/background', auth(), removeBackground);
router.post('/:userId/follow', auth(), followUser);



module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
