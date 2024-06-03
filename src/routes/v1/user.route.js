const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const multer = require('multer');
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');
const router = express.Router();

const path = require('path');


const rateLimit = require('express-rate-limit');



const {networkAlumni,
  networkAlumniByDegreeSpec,
  networkThisAlumni,
  applicantByPost,
  applicantByEvent,
  applicantByJob
} = require('../services/networking/school_network')
const { whoami, retrievepostmy, changeGeneral, changeAttachment, addAttachment, deleteAttachment, uploadAvatar, uploadBackground, threadIds, wwvtag, querysearch, werewolf, postOverview} = require('../controllers/whoami')
const { networkbyskills, networkbyabout,
matchuserbyAttach,
getAllbycred
} = require('../services/networking/user_network')


const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const {
  searchInstitute,
  fetchLinkedIn,
  fetchLinkedInLocReccomendation,
  fetchNewsLocationCategories,
  fetchLinkedInSkillsPointed,
  fetchNewsLocation,
} = require('../controllers/get_univ')

const {
  getIndeedjobs,
  getIndeedJobsBySkillSingle,
  getIndeedJobsBySkillRoulette,
  getIndeedJobsByQueryRoulette,
  getIndeedJobsByQueryDefaultRoulette,
} = require('../services/getIndeedJob')

// const {
//   getLinkedinJobsGeneric
// } = require('../services/linkedin/searchjobs')

{/*school*/}

const {
  addDesc,
  addCommit
} = require('../controllers/school/user.controller')


const {
  screatePost,
  sretrievePost,
  sdeletePost,
  sretrievePostFeed,
  sretrieveSuggestedPosts,
  sretrieveHashtagPosts,
  sretrieveAllPosts,
  sretrieveQueryPosts,
  sretrievePostLoc,
  sretrievePostMatchBySkills,
  votethispost
} = require('../controllers/school/post.controller.js');



const {
  sscreatePost,
  ssretrievePost,
  ssdeletePost,
  ssretrievePostFeed,
  ssretrieveSuggestedPosts,
  ssretrieveHashtagPosts,
  ssretrieveAllPosts,
  ssretrieveQueryPosts,
  ssretrievePostLoc,
} = require('../controllers/school/newswire.controller.js');

const {
  createJob,
  retrievejob,
  deleteJob,
  retrieveJobFeed,
  retrieveSuggestedJobs,
  retrieveHashtagJobs,
  retrieveAllJobs,
  retriveQueryJobs,
 retrieveJobLoc,
 retrieveJobMatchBySkills,
 matchjobsbyAttach,
 jobnetbyabout
} = require('../controllers/school/job.controller.js');

const {
  createEvent,
  retrieveEvent,
  deleteEvent,
  retrieveEventFeed,
  retrieveSuggestedEvents,
  retrieveHashtagEvents,
  sretrieveAllEvents,
  sretrieveQueryEvents,
  sretrieveEventLoc,
  sretrieveEventMatchBySkills
} = require('../controllers/school/event.controller.js');

const {
  sretrieveUser,
  sretrievePosts,
  sretrieveJobs,
  sretrieveDescriptions,
  sretrieveEvents,
  sretrieveCommits,
  sfollowUser,
  sretrieveFollowing,
  sretrieveFollowers,
  ssearchUsers,
  sconfirmUser,
  schangeAvatar,
  sremoveAvatar,
  schangeBackground,
  sremoveBackground,
  supdateProfile,
  sretrieveSuggestedUsers,
} = require('../controllers/school/user.controller');





router.post('/school/add/description', auth('school'), addDesc)
router.post('/add/commit', postLimiter, auth('school'), upload, addCommit);

{/*post section*/}


router.post('/school/post', postLimiter, auth('school'), upload, screatePost);
router.get('/school/suggested/post/:offset', auth(), sretrieveSuggestedPosts)
router.get('/school/post/:postId', sretrievePost);
router.get('/school/post/feed/:offset', auth(), sretrievePostFeed);
// router.get('/school/post/hashtag/:hashtag/:offset', auth(), sretrieveHashtagPosts);
router.delete('/school/post/:postId', auth('school'), sdeletePost);

router.get('/school/post/fetch/all', sretrieveAllPosts)
router.get('/school/post/q/:query', sretrieveQueryPosts)
router.get('/school/post/q/matchby/loc', auth(), sretrievePostLoc)
router.get('/school/post/q/matchby/skills', auth('user'), sretrievePostMatchBySkills)




{/*news section*/}


router.post('/school/news', postLimiter, auth('school'), upload, sscreatePost);

router.get('/school/news/:postId', ssretrievePost);
router.get('/school/news/feed/:offset', auth(), ssretrievePostFeed);
router.get('/school/news/hashtag/:hashtag/:offset', auth(), ssretrieveHashtagPosts);
router.delete('/school/news/:postId', auth('school'), ssdeletePost);

router.get('/school/news/fetch/all', ssretrieveAllPosts)
router.get('/school/news/q/:query', ssretrieveQueryPosts)
router.get('/school/news/q/matchby/loc', auth(), ssretrievePostLoc)
{/*news preference algorithm goes here*/}



{/*job section*/}

router.post('/school/job', postLimiter, auth('school'), upload, createJob);
router.get('/school/job/:jobId', retrievejob);
router.get('/school/job/feed/:offset', auth(), retrieveJobFeed);
router.get('/school/job/hashtag/:hashtag/:offset', auth(), retrieveHashtagJobs);
router.delete('/school/job/:jobId', auth('school'), deleteJob);

{/*retrieve algol*/}

//retrieve all jobs
router.get('/school/job/fetch/all', retrieveAllJobs)
router.get('/school/job/q/:query', retriveQueryJobs)
router.get('/school/job/q/matchby/loc', auth(), retrieveJobLoc)
router.get('/school/job/q/matchby/skills', auth('user'), retrieveJobMatchBySkills)
router.get('/school/job/matchby/this/cred', auth('user'), matchjobsbyAttach)
router.get('/school/job/matchby/this/about', auth('user'), jobnetbyabout)
{/*Event section*/}

router.post('/school/event', postLimiter, auth('school'), upload, createEvent);
router.get('/school/event/:eventId', retrieveEvent);
router.get('/school/event/feed/:offset', auth(), retrieveEventFeed);
router.get('/school/event/hashtag/:hashtag/:offset', auth(), retrieveHashtagEvents);
router.delete('/school/event/:eventId', auth('school'), deleteEvent);

router.get('/school/event/fetch/all', sretrieveAllEvents)
router.get('/school/event/q/:query', sretrieveQueryEvents)
router.get('/school/event/q/matchby/loc', auth(), sretrieveEventLoc)
router.get('/school/event/q/matchby/skills', auth('user'), sretrieveEventMatchBySkills)


{/*user section*/}
  router.get('/sys/whoami', auth(), whoami)
  router.get('/school/suggested/:max?', auth(), sretrieveSuggestedUsers);
router.get('/school/:username', sretrieveUser);
router.get('/school/:username/posts/:offset', sretrievePosts);
router.get('/school/:username/jobs/:offset', sretrieveJobs);
router.get('/school/:username/events/:offset', sretrieveEvents);
router.get('/school/:username/descriptions/:offset', sretrieveDescriptions);
router.get('/school/:username/commits/:offset', sretrieveCommits);
router.get('/school/:userId/:offset/following', auth(), sretrieveFollowing);
router.get('/school/:userId/:offset/followers', auth(), sretrieveFollowers);
router.get('/school/:username/:offset/search', ssearchUsers);
router.put(
  '/school/avatar',
  auth('school'),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  schangeAvatar
);
router.put('/school/', auth('school'), supdateProfile);

router.delete('/school/avatar', auth('school'), sremoveAvatar);

router.put(
  '/school/background',
  auth('school'),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  schangeBackground
);
router.delete('/school/background', auth('school'), sremoveBackground);
router.post('/school/:userId/follow', auth(), sfollowUser);





{/**/}



const {
  createPost,
  retrievePost,
  votePost,
  deletePost,
  retrievePostFeed,
  retrieveSuggestedPosts,
  retrieveHashtagPosts,
} = require('../controllers/postController');

const {
  createComment,
  deleteComment,
  voteComment,
  createCommentReply,
  deleteCommentReply,
  voteCommentReply,
  retrieveCommentReplies,
  retrieveComments,
  parrent,
  replies
} = require('../controllers/commentController');


const {
  retrieveNotifications,
  readNotifications,
} = require('../controllers/notificationController');




const {
  retrieveUser,
  retrievePosts,
  // bookmarkPost,
  followUser,
  retrieveFollowing,
  retrieveFollowers,
  searchUsers,
  // confirmUser,
  changeAvatar,
  removeAvatar,
  updateProfile,
  retrieveSuggestedUsers,
  changeBackgroundPic,
  removeBackgroundPic
} = require('../controllers/userController');


router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);
  
  
  /*new response*/
  
  /*CRUD*/

/*auth already decoded what role you're in.*/
  
router.post('/add/outlook', validate(userValidation.addOutlookValidation),auth('user'), userController.addOutlook);
router.get('/get/outlook', userController.getOutlook);
router.delete('/delete/outlook', auth('user') , userController.deleteOutlook);
router.put('/edit/outlook', validate(userValidation.addOutlookValidation),auth('user'), userController.putOutlook);

router.post('/add/about', validate(userValidation.addAboutValidation),auth('user'), userController.addAbout);
router.get('/get/about', userController.getAbout);
router.delete('/delete/about', auth('user') , userController.deleteAbout);
router.put('/edit/about', validate(userValidation.addAboutValidation),auth('user'), userController.putAbout);


router.post('/add/Org', validate(userValidation.addAccompOrgValidation), auth('user'), userController.addAccompOrg);
router.get('/get/Org', userController.getAccompOrg);
router.delete('/delete/Org', auth('user'), userController.deleteAccompOrg);
router.put('/edit/Org', validate(userValidation.addAccompOrgValidation), auth('user'), userController.putAccompOrg);

router.post('/add/cert', validate(userValidation.addAccCertValidation), auth('user'), userController.addAccompCert);
router.get('/get/cert', userController.getAccompCert);
router.delete('/delete/cert', auth('user'), userController.deleteAccompCert);
router.put('/edit/cert', validate(userValidation.addAccCertValidation), auth('user'), userController.putAccompCert);

router.post('/add/lang', validate(userValidation.addAccLangValidation), auth('user'), userController.addAccompLang);
router.get('/get/lang', userController.getAccompLang);
router.delete('/delete/lang', auth('user'), userController.deleteAccompLang);
router.put('/edit/lang', validate(userValidation.addAccLangValidation), auth('user'), userController.putAccompLang);

router.post('/add/awrd', validate(userValidation.addAccAwrdValidation), auth('user'), userController.addAccompAwrd);
router.get('/get/awrd', userController.getAccompAwrd);
router.delete('/delete/awrd', auth('user'), userController.deleteAccompAwrd);
router.put('/edit/awrd', validate(userValidation.addAccAwrdValidation), auth('user'), userController.putAccompAwrd);

router.post('/add/proj', validate(userValidation.addAccProjValidation), auth('user'), userController.addAccompProj);
router.get('/get/proj', userController.getAccompProj);
router.delete('/delete/proj', auth('user'), userController.deleteAccompProj);
router.put('/edit/proj', validate(userValidation.addAccProjValidation), auth('user'), userController.putAccompProj);

router.post('/add/pub', validate(userValidation.addAccPubValidation), auth('user'), userController.addAccompPub);
router.get('/get/pub', userController.getAccompPub);
router.delete('/delete/pub', auth('user'), userController.deleteAccompPub);
router.put('/edit/pub', validate(userValidation.addAccPubValidation), auth('user'), userController.putAccompPub);

router.post('/add/score', validate(userValidation.addAccTestScoreValidation), auth('user'), userController.addAccompScore);
router.get('/get/score', userController.getAccompScore);
router.delete('/delete/score', auth('user'), userController.deleteAccompScore);
router.put('/edit/score', validate(userValidation.addAccTestScoreValidation), auth('user'), userController.putAccompScore);

router.post('/add/experience', validate(userValidation.userSkillValidation), auth('user'), userController.addExperience);
router.get('/get/experience', userController.getExperience);
router.delete('/delete/experience', auth('user'), userController.deleteExperience);
router.put('/edit/experience', validate(userValidation.userSkillValidation), auth('user'), userController.putExperience);

router.post('/add/externals', validate(userValidation.externalValidation), auth('user'), upload, userController.addExternals);
router.get('/get/externals', userController.getExternals);
router.delete('/delete/externals', auth('user'), userController.deleteExternals);
router.put('/edit/externals', validate(userValidation.externalValidation), auth('user'), userController.putExternals);



// router.post('/add/Org', validate(userValidation.addAccompOrgValidation),auth(), userController.addAccompOrg);

// router.post('/add/cert', validate(userValidation.addAccCertValidation),auth(), userController.addAccompCert);

// router.post('/add/lang', validate(userValidation.addAccLangValidation),auth(), userController.addAccompLang);

// router.post('/add/awrd', validate(userValidation.addAccAwrdValidation),auth(), userController.addAccompAwrd);

// router.post('/add/proj', validate(userValidation.addAccProjValidation),auth(), userController.addAccompProj);

// router.post('/add/pub', validate(userValidation.addAccPubValidation),auth(), userController.addAccompPub);

// router.post('/add/score', validate(userValidation.addAccTestScoreValidation),auth(), userController.addAccompScore);

// router.post('/add/experience', validate(userValidation.userSkillValidation),auth(), userController.addExperience);

// router.post('/add/externals', validate(userValidation.externalValidation),auth(), userController.addExternals);

router.post('/post', postLimiter, auth('user'), upload, createPost);
router.post('/post/:postId/vote', auth(), votePost);

router.get('/post/suggested/:offset', auth(), retrieveSuggestedPosts);

router.get('/post/:postId', retrievePost);
router.get('/post/feed/:offset', auth(), retrievePostFeed);
router.get('/www/tag/:hashtag', wwvtag);

router.delete('/post/:postId', auth('user'), deletePost);




router.get('/suggested/:max?', auth(), retrieveSuggestedUsers);

router.get('/wwwparf/get/', werewolf);
router.get('/www/search/', querysearch)
/*fix unique identifier in fistname and lastname besides _id like username for example. or otherwise exist validation but it's probably not gonna do it*/

/*if everything goes wrong with full name parameter, use an id*/
router.get('/bfn/thisqueryfuckyou/',auth(), postOverview )
router.get('/:username/posts/:offset', retrievePosts);

router.get('/following/:userId/:offset/following', auth(), retrieveFollowing);
router.get('/followers/:userId/:offset', auth(), retrieveFollowers);
router.get('/:username/:offset/search', searchUsers);


//router.put('/confirm', auth(), confirmUser);

router.put(
  '/update/avatar',
  auth('user'),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  changeAvatar
);

router.put(
  '/update/background',
  auth('user'),
  multer({
    dest: 'temp/',
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 1000000 },
  }).single('image'),
  changeBackgroundPic
);

router.put('/update/profile', auth('user'), updateProfile);

router.delete('/update/avatar', auth('user'), removeAvatar);
router.delete('/delete/background', auth('user'), removeBackgroundPic);
// router.post('/:postId/bookmark', auth(), bookmarkPost);
router.post('/follow/:userId', auth(), followUser);



router.post('/comment/:postId', auth(), createComment);
router.post('/:commentId/vote', auth(), voteComment);
router.post('/:commentReplyId/replyVote', auth(), voteCommentReply);
router.post('/:parentCommentId/reply', auth(), createCommentReply);

router.get('/:parentCommentId/:offset/replies/', retrieveCommentReplies);
router.get('/:postId/:offset/:exclude', retrieveComments);

router.delete('/:commentId', auth(), deleteComment);
router.delete('/:commentReplyId/reply', auth(), deleteCommentReply);
router.get('/parrent/:postId/',parrent)
router.get('/replies/:parentId/',replies)
router.get('/thread/:threadId', threadIds)

router.get('/notif/', auth('user'), retrieveNotifications);

router.put('/notif/', auth('user'), readNotifications);


{/*linkedin part of*/}

router.get('/school/search/institute/:search_university/limit/:search_limit', searchInstitute)

router.get('/linkedin/jobs', auth(), fetchLinkedIn);

router.get('/linkedin/jobs/alg/byloc', auth(), fetchLinkedInLocReccomendation)

router.get('/linkedin/jobs/alg/skillpointed/default_q', auth('user'), fetchLinkedInSkillsPointed)

router.get('/news/location/', auth(), fetchNewsLocation)

router.get('/news/location/categories/:categories', auth(), fetchNewsLocationCategories)


{/*email service*/}

const { emailValidations } = require('../middleware/validations.js')
const {
  getAllEmails,
  sendEmail,
  saveDraft,
  updateDraft,
  moveToTrash,
  removeFromTrash,
  toggleEmailProperty,
  deleteEmail,
} = require('../controllers/email.controller.js');


router.get('/GET/email/', auth(), getAllEmails);
router.post('/email/send', auth(), [...emailValidations], sendEmail);
router.post('/email/draft', auth(), saveDraft);
router.put('/email/draft/:id', auth(), updateDraft);
router.put('/email/:id/trash', auth(), moveToTrash);
router.put('/email/:id/untrash', auth(), removeFromTrash);
router.put('/email/:id/:toggle', auth(), toggleEmailProperty);
router.delete('/email/:id', auth(), deleteEmail);

{/*linkedin*/}

// router.get('/search/GET/linkedin/jobs/:keyword/location/:location', auth(), getLinkedinJobsGeneric)

{/*indeed*/}

router.get('/fegtchfetch/jobs/indeed', auth(), getIndeedjobs);
router.get('/GET/jobs/indeed/randomquery/skill_pointed', auth('user'), getIndeedJobsBySkillSingle)
router.get('/GET/jobs/indeed/randomquery/skill_pointed/randomized', auth('user'), getIndeedJobsBySkillRoulette)
router.get('/GET/jobs/indeed/randomquery/query/:queryParam/randomized', auth('user'), getIndeedJobsByQueryRoulette)
router.get('/GET/jobs/indeed/randomquery/default/randomized', auth('user'), getIndeedJobsByQueryDefaultRoulette)




{/*networking & get applicants*/}


router.get('/urb/network/matchby/alumni', auth('user'), networkAlumni)
router.get('/urb/network/matchby/alumni/skillspec', auth('user'), networkAlumniByDegreeSpec)
router.get('/urb/network/matchby/thisalumni', auth('school'), networkThisAlumni)
router.get('/urb/network/applicant/matchby/thispost', auth('school'), applicantByPost)
router.get('/urb/network/applicant/matchby/thisevent', auth('school'), applicantByEvent)
router.get('/urb/network/applicant/matchby/thisjob', auth('school'), applicantByJob)
//router.get('/urb/network/applicant/matchby/themAccs', auth('school'), applicantByThemAccs)
//router.get('/urb/network/applicant/matchby/themAbout', auth('school'), applicantByThemAbout)
//router.get('/urb/network/applicant/matchby/themEdDegree', auth('school'), applicantByThemEducationDegree)
//router.get('/urb/network/applicant/matchby/themSkills', auth('school'), applicantByThemSkills)
{/*is this done? i already fetch the accs, about, skills in job. not a job? then what?*/}

router.get('/urb/network/matchby/user/skills', auth('user'), networkbyskills)
router.get('/urb/network/matchby/user/about', auth('user'), networkbyabout)
router.get('/urb/network/matchby/user/attach', auth('user'), matchuserbyAttach)
router.get('/urb/network/get/all/attach/limit/:sortbylimit', getAllbycred)

router.post('/urb/verify', auth(), (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});




router.get('/fetchmy/post', auth(), retrievepostmy)
router.put('/edit/profile', auth('user'), changeGeneral)
router.put('/edit/attachment', auth('user'), changeAttachment)
router.post('/post/attachment', auth('user'), addAttachment)
router.delete('/delete/attachment', auth('user'), deleteAttachment)
router.post('/post/avatar', auth(), upload, uploadAvatar)
router.post('/post/background', auth(), upload, uploadBackground)
router.post('/post/:postId/votepost', auth(), votethispost)
// router.get('/GET/jobs/indeed/byloc/', auth(), getIndeedJobsByLoc)

// router.get('/GET/jobs/indeed/bytype/', auth(), getIndeedJobsByType)

// router.get('/GET/jobs/indeed/bylevel/', auth(), getIndeedJobsByLevel)


/*Search for user other creds. (e.g.) education, org, etc.*/


// router.post(
//   '/post/',
//   // postLimiter,
//   validate(userValidation.addPostValidation),
//   auth(),
//   upload.single('profile-file'),
//   userController.addPost
// );

// router.post('/vote/:postId',auth(), userController.votePost);

// // router.get('/suggested/:offset', validate(userValidation.addAccTestScoreValidation),auth(), userController.postVote);

// router.get('/post/:postId',auth(), userController.getPost);

// // router.get('/feed/:offset', validate(userValidation.addAccTestScoreValidation),auth(), userController.postVote);

// router.get('/hashtag/:hashtag/:offset', userController.getHashtagPost);

// router.delete('/post/:postId/',auth(), userController.deletePost);

// router.post('/follow/:userId',auth(), userController.followUser);

//router.post('/follow/:userId', (function(req, res) {
//   userController.followUser(req, res);
// })());




// router.post('/add_accomp/score', validate(userValidation.addAccTestScoreValidation),auth(), userController.addAccompScore);

// router.post('/add_accomp/score', validate(userValidation.addAccTestScoreValidation),auth(), userController.addAccompScore);

// router.post('/add_accomp/score', validate(userValidation.addAccTestScoreValidation),auth(), userController.addAccompScore);

// router.post('/add_accomp/score', validate(userValidation.addAccTestScoreValidation),auth(), userController.addAccompScore);




// router.post('/addoutlook', function(req, res, next) {
//   validate(userValidation.addOutlookValidation)(req, res, function(err) {
//     if (err) {
//       return res.status(400).send(err); // You might want to customize the error response
//     }
//     auth()(req, res, function() {
//       userController.addOutlook(req, res);
//     });
//   });
// });



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
