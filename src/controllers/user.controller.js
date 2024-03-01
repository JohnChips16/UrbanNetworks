const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const addOutlook = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const outlook = await userService.addOutlook(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(outlook);
});

const getOutlook = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const outlook = await userService.getOutlook(currentUser
  );
  res.status(httpStatus.CREATED).send(outlook);
});

const deleteOutlook = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const outlook = await userService.deleteOutlook(currentUser
  );
  res.status(httpStatus.CREATED).send(outlook);
});

const putOutlook = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const outlook = await userService.putOutlook(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(outlook);
});

const addAbout = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const about = await userService.addAbout(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(about);
});


const getAbout = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const about = await userService.getAbout(currentUser
  );
  res.status(httpStatus.CREATED).send(about);
});

const deleteAbout = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const about = await userService.deleteAbout(currentUser
  );
  res.status(httpStatus.CREATED).send(about);
});

const putAbout = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const { about } = req.body; // Extract 'about' from req.body
  const updatedAbout = await userService.putAbout(currentUser, about);
  res.status(httpStatus.CREATED).send(updatedAbout);
});


const addAccompOrg = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompOrg = await userService.addAccompOrg(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompOrg);
})


const getAccompOrg = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompOrg = await userService.getAccompOrg(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompOrg);
});

const deleteAccompOrg = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompOrg = await userService.deleteAccompOrg(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompOrg);
});

const putAccompOrg = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompOrg = await userService.putAccompOrg(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompOrg);
});

const addAccompCert = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompCert = await userService.addAccompCert(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompCert);
});


const getAccompCert = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompCert = await userService.getAccompCert(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompCert);
});

const deleteAccompCert = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompCert = await userService.deleteAccompCert(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompCert);
});

const putAccompCert = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompCert = await userService.putAccompCert(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompCert);
});

const addAccompLang = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompLang = await userService.addAccompLang(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompLang);
});


const getAccompLang = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompLang = await userService.getAccompLang(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompLang);
});

const deleteAccompLang = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompLang = await userService.deleteAccompLang(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompLang);
});

const putAccompLang = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompLang = await userService.putAccompLang(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompLang);
});

const addAccompAwrd = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompAwrd = await userService.addAccompAwrd(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompAwrd);
});


const getAccompAwrd = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompAwrd = await userService.getAccompAwrd(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompAwrd);
});

const deleteAccompAwrd = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompAwrd = await userService.deleteAccompAwrd(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompAwrd);
});

const putAccompAwrd = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompAwrd = await userService.putAccompAwrd(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompAwrd);
});

const addAccompProj = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompProj = await userService.addAccompProj(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompProj);
});


const getAccompProj = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompProj = await userService.getAccompProj(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompProj);
});

const deleteAccompProj = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompProj = await userService.deleteAccompProj(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompProj);
});

const putAccompProj = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompProj = await userService.putAccompProj(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompProj);
});

const addAccompPub = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accomPub = await userService.addAccompPub(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accomPub);
})


const getAccompPub = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompPub = await userService.getAccompPub(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompPub);
});

const deleteAccompPub = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompPub = await userService.deleteAccompPub(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompPub);
});

const putAccompPub = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompPub = await userService.putAccompPub(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompPub);
});


const addExperience = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const addExperience = await userService.addExperience(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(addExperience);
});


const getExperience = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Experience = await userService.getExperience(currentUser
  );
  res.status(httpStatus.CREATED).send(Experience);
});

const deleteExperience = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Experience = await userService.deleteExperience(currentUser
  );
  res.status(httpStatus.CREATED).send(Experience);
});

const putExperience = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Experience = await userService.putExperience(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(Experience);
});


const addExternals = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const addExternals = await userService.addExternals(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(addExternals);
});


const getExternals = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Externals = await userService.getExternals(currentUser
  );
  res.status(httpStatus.CREATED).send(Externals);
});

const deleteExternals = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Externals = await userService.deleteExternals(currentUser
  );
  res.status(httpStatus.CREATED).send(Externals);
});

const putExternals = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const Externals = await userService.putExternals(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(Externals);
});


const addAccompScore = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const accompScore = await userService.addAccompScore(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(accompScore);
});


const getAccompScore = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompScore = await userService.getAccompScore(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompScore);
});

const deleteAccompScore = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompScore = await userService.deleteAccompScore(currentUser
  );
  res.status(httpStatus.CREATED).send(AccompScore);
});

const putAccompScore = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const AccompScore = await userService.putAccompScore(currentUser, req.body
  );
  res.status(httpStatus.CREATED).send(AccompScore);
});



const addPost = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const fileReq = req.file;
  const post = await userService.addPost(currentUser, fileReq, req.body
  );
  res.status(httpStatus.CREATED).send(post);
});

const followUser = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const userId = req.params.userId; // Extracted the userId property
  
  try {
    const followUserResult = await userService.followUser(currentUser, userId, req, res);
    res.status(httpStatus.CREATED).send(followUserResult);
  } catch (error) {
    // Handle error appropriately, you might want to send an error response
    console.error('Error following user:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal Server Error' });
  }
});


const votePost = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const postId = req.params;
  
  const votePost = await userService.votePost(currentUser, postId
  );
  res.status(httpStatus.CREATED).send(votePost);
});


const getPost = catchAsync(async (req, res) => {
  const postId = req.params;
  const post = await userService.getPost(postId
  );
  res.status(httpStatus.CREATED).send(post);
});


const deletePost = catchAsync(async (req, res) => {
  const postId = req.params;
  const currentUser = req.user;
  
  const post = await userService.deletePost(currentUser, postId
  );
  res.status(httpStatus.OK).send(post);
});


const getHashtagPost = catchAsync(async (req, res) => {
  const { hashtag, offset} = req.params;
  
  const post = await userService.getHashtagPost(hashtag, offset
  );
  res.status(httpStatus.OK).send(post);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addOutlook,
  addAbout,
  addAccompOrg,
  addAccompCert,
  addAccompLang,
  addAccompAwrd,
  addAccompProj,
  addAccompPub,
  addAccompScore,
  addPost,
  followUser,
  votePost,
  getPost,
  deletePost,
  getHashtagPost,
  addExternals,
  addExperience,
  getOutlook,
  getAbout,
  getAccompCert,
  getAccompOrg,
  getAccompLang,
  getAccompAwrd,
  getAccompProj,
  getAccompPub,
  getExperience,
  getExternals,
  getAccompScore,
  putOutlook,
  putAbout,
  putAccompOrg,
  putAccompCert,
  putAccompLang,
  putAccompAwrd,
  putAccompPub,
  putExternals,
  putExperience,
  putAccompScore,
  putAccompProj,
  deleteAbout,
  deleteOutlook,
  deleteAccompOrg,
  deleteAccompCert,
  deleteAccompLang,
  deleteAccompAwrd,
  deleteAccompProj,
  deleteAccompPub,
  deleteExperience,
  deleteExternals,
  deleteAccompScore
};
