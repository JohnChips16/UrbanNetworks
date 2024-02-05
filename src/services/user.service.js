const httpStatus = require('http-status');
const { User, Education, AccompOrg, AccCert, AccLang, AccAwrd, AccProj, AccPub, AccTestScore, Post, Following, Followers, Notification, PostVote, Experience, Externals, School } = require('../models');
const ApiError = require('../utils/ApiError');
const socketHandler = require('../handlers/socketHandler');
const fs = require('fs');
const { ObjectID } = require('mongodb');

const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const { retrieveComments, populatePostsPipeline } = require('../utils/controllerUtils')
// const {
//   retrieveComments,
//   formatCloudinaryUrl,
//   populatePostsPipeline,
// } = require('../utils/controllerUtils');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
 
 const isValidObjectId = (id) => {
  try {
    new ObjectId(id);
    return true;
  } catch (error) {
    return false;
  }
};
 
 
 
 const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  } else if (await User.isPhoneTaken(userBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  } else {
    return User.create(userBody);
  }
};


 const createSchool = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  } else if (await User.isPhoneTaken(userBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  } else {
    return User.create(userBody);
  }
};

const addOutlook = async (currentUser, educationDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  if (!user.education) {
    user.education = [];
  }

  const outlook = await Education.create({
    ...educationDetails,
    user: currentUser._id,
  });

  user.education.push(outlook._id);
  await user.save();

  return outlook;
};


const addAbout = async (currentUser, aboutDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.about = aboutDetails.about;
  
  await user.save();
  return user;
};

const addAccompOrg = async (currentUser, OrgDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompOrg) {
    user.accompOrg = [];
  }

  const accompOrg = await AccompOrg.create({
    ...OrgDetails,
    user: currentUser._id,
  });

  user.accompOrg.push(accompOrg._id);
  await user.save();

  return accompOrg;
};


const addAccompCert = async (currentUser, CertDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompCert) {
    user.accompCert = [];
  }

  const accompCert = await AccCert.create({
    ...CertDetails,
    user: currentUser._id,
  });

  user.accompCert.push(accompCert._id);
  await user.save();

  return accompCert;
};


const addAccompLang= async (currentUser, LangDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompLang) {
    user.accompLang = [];
  }

  const accompLang = await AccLang.create({
    ...LangDetails,
    user: currentUser._id,
  });

  user.accompLang.push(accompLang._id);
  await user.save();

  return accompLang;
};



const addAccompAwrd = async (currentUser, AwrdDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompAwrd) {
    user.accompAwrd = [];
  }

  const accompAwrd = await AccAwrd.create({
    ...AwrdDetails,
    user: currentUser._id,
  });

  user.accompAwrd.push(accompAwrd._id);
  await user.save();

  return accompAwrd;
};



const addAccompProj = async (currentUser, ProjDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompProj) {
    user.accompProj = [];
  }

  const accompProj = await AccProj.create({
    ...ProjDetails,
    user: currentUser._id,
  });

  user.accompProj.push(accompProj._id);
  await user.save();

  return accompProj;
};



const addAccompPub = async (currentUser, PubDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompPub) {
    user.accompPub = [];
  }

  const accompPub = await AccPub.create({
    ...PubDetails,
    user: currentUser._id,
  });

  user.accompPub.push(accompPub._id);
  await user.save();

  return accompPub;
};



const addExperience = async (currentUser, details) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  

  const addExperience = await Experience.create({
    ...details,
    user: currentUser._id,
  });

  
  await user.save();

  return addExperience;
};



const addExternals = async (currentUser, details) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  

  const addExternals = await Externals.create({
    ...details,
    user: currentUser._id,
  });

  
  await user.save();

  return addExternals;
};



const addAccompScore = async (currentUser, ScoreDetails) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.accompScore) {
    user.accompScore = [];
  }

  const accompScore = await AccTestScore.create({
    ...ScoreDetails,
    user: currentUser._id,
  });

  user.accompScore.push(accompScore._id);
  await user.save();

  return accompScore;
};


const addPost = async (currentUser, fileReq, postBody, req, res, next) => {
  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const hashtags = [];
  linkify.find(postBody.caption).forEach((result) => {
    if (result.type === 'hashtag') {
      hashtags.push(result.value.substring(1));
    }
  });
   
  
   
  let attachmentUrl;
  if (fileReq) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const response = await cloudinary.uploader.upload(fileReq.path);
      attachmentUrl = response.secure_url;
      fs.unlinkSync(fileReq.path);
    } catch (error) {
      return next({ message: 'Error uploading image, please try again later.' });
    }
  }

  const post = await Post.create({
    ...postBody,
    attachment: attachmentUrl,
    caption: postBody.caption, // Assuming caption is part of postBody
    author: currentUser._id,
    hashtags,
  });

  const postVote = new PostVote({
    post: post._id,
  });

  await post.save();
  await user.save();
  await postVote.save();

  const statPost = ({
    ...post.toObject(),
    postVotes: [],
    comments: [],
    author: { firstName: user.firstName, lastName: user.lastName },
  });
  
try {
  // Updating followers feed with post
  const followersDocument = await followersModel.find({ user: user._id });

  if (followersDocument[0] && followersDocument[0].followers) {
    const followers = followersDocument[0].followers;
    const postObject = {
      ...post.toObject(),
      author: { firstName: user.firstName, lastName: user.lastName },
      commentData: { commentCount: 0, comments: [] },
      postVotes: [],
    };

    followers.forEach((follower) => {
      socketHandler.sendPost(req, postObject, follower.user);
    });
  } else {
    console.error('Followers not found in the document.');
  }
} catch (error) {
  // Handle error if necessary
  console.error('Error updating followers feed:', error);
}
 /*Build follower[ing] CRUD*/

  return statPost;
};


const followUser = async (currentUser, userId, req, res, next) => {
  
  const user = await User.findById(currentUser._id);

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res
        .status(400)
        .send({ error: 'Could not find a user with that id.' });
    }

    const followerUpdate = await Followers.updateOne(
      { user: userId, 'followers.user': { $ne: user._id } },
      { $push: { followers: { user: user._id } } }
    );

    const followingUpdate = await Following.updateOne(
      { user: user._id, 'following.user': { $ne: userId } },
      { $push: { following: { user: userId } } }
    );

    if (!followerUpdate.nModified || !followingUpdate.nModified) {
      if (!followerUpdate.ok || !followingUpdate.ok) {
        return res
          .status(500)
          .send({ error: 'Could not follow user please try again later.' });
      }
      // Nothing was modified in the above query meaning that the user is already following
      // Unfollow instead
      const followerUnfollowUpdate = await Followers.updateOne(
        {
          user: userId,
        },
        { $pull: { followers: { user: user._id } } }
      );

      const followingUnfollowUpdate = await Following.updateOne(
        { user: user._id },
        { $pull: { following: { user: userId } } }
      );
      if (!followerUnfollowUpdate.ok || !followingUnfollowUpdate.ok) {
        return res
          .status(500)
          .send({ error: 'Could not follow user please try again later.' });
      }
      return res.send({ success: true, operation: 'unfollow' });
    }

    const notification = new Notification({
      notificationType: 'follow',
      sender: user._id,
      receiver: userId,
      date: Date.now(),
    });

    const sender = await User.findById(user._id, 'firstName lastName');
    const isFollowing = await Following.findOne({
      user: userId,
      'following.user': user._id,
    });

    await notification.save();
    socketHandler.sendNotification(req, {
      notificationType: 'follow',
      sender: {
        _id: sender._id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        
      },
      receiver: userId,
      date: notification.date,
      isFollowing: !!isFollowing,
    });

    res.send({ success: true, operation: 'follow' });
  } catch (err) {
    next(err);
  }
};


const votePost = async (currentUser, postId, req, res, next) => {
  const user = await User.findById(currentUser._id);

  try {
    // Update the vote array if the user has not already liked the post
    const postLikeUpdate = await PostVote.updateOne(
      { post: postId, 'votes.author': { $ne: user._id } },
      {
        $push: { votes: { author: user._id } },
      }
    );
    if (!postLikeUpdate.nModified) {
      if (!postLikeUpdate.ok) {
        return res.status(500).send({ error: 'Could not vote on the post.' });
      }
      // Nothing was modified in the previous query meaning that the user has already liked the post
      // Remove the user's like
      const postDislikeUpdate = await PostVote.updateOne(
        { post: postId },
        { $pull: { votes: { author: user._id } } }
      );

      if (!postDislikeUpdate.nModified) {
        return res.status(500).send({ error: 'Could not vote on the post.' });
      }
    } else {
      // Sending a like notification
      const post = await Post.findById(postId);
      if (String(post.author) !== String(user._id)) {
        // Create thumbnail link
        // const image = formatCloudinaryUrl(
        //   post.image,
        //   {
        //     height: 50,
        //     width: 50,
        //   },
        //   true
        // );
        const notification = new Notification({
          sender: user._id,
          receiver: post.author,
          notificationType: 'like',
          date: Date.now(),
          notificationData: {
            postId,
            // image,
            // filter: post.filter,
          },
        });

        await notification.save();
        socketHandler.sendNotification(req, {
          ...notification.toObject(),
          sender: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
         
          },
        });
      }
    }
    return res.send({ success: true });
  } catch (err) {
    console.log(err);
  }
};


const getPost = async (postId, req, res, next) => {
  try {
    // Validate if postId is a valid ObjectID
    if (!isValidObjectId(postId)) {
      return ({ error: 'Invalid postId format.' });
    }

    // Retrieve the post and the post's votes
    const post = await Post.aggregate([
      { $match: { _id: ObjectID(postId) } },
      {
        $lookup: {
          from: 'postvotes',
          localField: '_id',
          foreignField: 'post',
          as: 'postVotes',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      { $unwind: '$postVotes' },
      {
        $unset: [
          'author.password',
          'author.email',
        ],
      },
      {
        $addFields: { postVotes: '$postVotes.votes' },
      },
    ]);

    if (post.length === 0) {
      return ({ error: 'Could not find a post with that id.' });
    }

    // Retrieve the comments associated with the post as well as the comment's replies and votes
    const comments = await retrieveComments(postId, 0);

    return ({ ...post[0], commentData: comments });
  } catch (err) {
    console.error(err);
    
  }
};


const deletePost = async (currentUser, postId, req, res, next) => {
  const user = await User.findById(currentUser._id);

  try {
    const post = await Post.findOne({ _id: postId, author: user._id });
    if (!post) {
      return res.status(404).send({
        error: 'Could not find a post with that id associated with the user.',
      });
    }
    // This uses pre hooks to delete everything associated with this post i.e comments
    const postDelete = await Post.deleteOne({
      _id: postId,
    });
    if (!postDelete.deletedCount) {
      return res.status(500).send({ error: 'Could not delete the post.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }

  try {
    const followersDocument = await Followers.find({ user: user._id });
    const followers = followersDocument[0].followers;
    socketHandler.deletePost(req, postId, user._id);
    followers.forEach((follower) =>
      socketHandler.deletePost(req, postId, follower.user)
    );
  } catch (err) {
    console.log(err);
  }
};


const getHashtagPost = async (hashtag, offset, req, res, next) => {

  try {
    const posts = await Post.aggregate([
      {
        $facet: {
          posts: [
            {
              $match: { hashtags: hashtag },
            },
            {
              $skip: Number(offset),
            },
            {
              $limit: 20,
            },
            ...populatePostsPipeline,
          ],
          postCount: [
            {
              $match: { hashtags: hashtag },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: '$postCount',
      },
      {
        $addFields: {
          postCount: '$postCount.count',
        },
      },
    ]);
    const sendGet = posts[0];
    return sendGet;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectID} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

const getSchoolById = async (id) => {
  return School.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getSchoolByEmail = async (email) => {
  return School.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectID} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectID} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};


const getOutlook = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await Education.find({ user: userId }).exec();
  return educationDetails;
}

const getAbout = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = user.about;
  return educationDetails;
}

const getAccompCert = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccCert.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompOrg = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccompOrg.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompLang = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccLang.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompAwrd = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccAwrd.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompProj = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccProj.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompPub = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccPub.find({ user: userId }).exec();
  return educationDetails;
}

const getExperience = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await Experience.find({ user: userId }).exec();
  return educationDetails;
}

const getExternals = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await Externals.find({ user: userId }).exec();
  return educationDetails;
}

const getAccompScore = async(currentUser) => {
  const user = await User.findById(currentUser._id);
  const educationDetails = await AccTestScore.find({ user: userId }).exec();
  return educationDetails;
}


const putOutlook = async (currentUser, educationDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingEducation = await Education.findOneAndUpdate(
      { user: currentUser._id },
      { $set: educationDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.education) {
      user.education = [];
    }

    if (existingEducation) {
      user.education.push(existingEducation._id);
    } else {
      const newEducation = await Education.create({
        ...educationDetails,
        user: currentUser._id,
      });
      user.education.push(newEducation._id);
    }

    await user.save();

    return existingEducation || newEducation;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating education details');
  }
};

const putAbout = async (currentUser, aboutDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.about = aboutDetails; // Update the 'about' field

    await user.save();

    return user.about;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating user about');
  }
};

const putAccompOrg = async (currentUser, accompOrgDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccompOrg = await AccompOrg.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accompOrgDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accompOrg) {
      user.accompOrg = [];
    }

    if (existingAccompOrg) {
      user.accompOrg.push(existingAccompOrg._id);
    } else {
      const newAccompOrg = await AccompOrg.create({
        ...accompOrgDetails,
        user: currentUser._id,
      });
      user.accompOrg.push(newAccompOrg._id);
    }

    await user.save();

    return existingAccompOrg || newAccompOrg;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accompOrg details');
  }
};


const putAccompCert = async (currentUser, accCertDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccCert = await AccCert.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accCertDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accCert) {
      user.accCert = [];
    }

    if (existingAccCert) {
      user.accCert.push(existingAccCert._id);
    } else {
      const newAccCert = await AccCert.create({
        ...accCertDetails,
        user: currentUser._id,
      });
      user.accCert.push(newAccCert._id);
    }

    await user.save();

    return existingAccCert || newAccCert;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accCert details');
  }
};



const putAccompLang = async (currentUser, accLangDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccLang = await AccLang.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accLangDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accLang) {
      user.accLang = [];
    }

    if (existingAccLang) {
      user.accLang.push(existingAccLang._id);
    } else {
      const newAccLang = await AccLang.create({
        ...accLangDetails,
        user: currentUser._id,
      });
      user.accLang.push(newAccLang._id);
    }

    await user.save();

    return existingAccLang || newAccLang;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accLang details');
  }
};


const putAccompAwrd = async (currentUser, accAwrdDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccAwrd = await AccAwrd.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accAwrdDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accAwrd) {
      user.accAwrd = [];
    }

    if (existingAccAwrd) {
      user.accAwrd.push(existingAccAwrd._id);
    } else {
      const newAccAwrd = await AccAwrd.create({
        ...accAwrdDetails,
        user: currentUser._id,
      });
      user.accAwrd.push(newAccAwrd._id);
    }

    await user.save();

    return existingAccAwrd || newAccAwrd;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accAwrd details');
  }
};



const putAccompProj = async (currentUser, accProjDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccProj = await AccProj.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accProjDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accProj) {
      user.accProj = [];
    }

    if (existingAccProj) {
      user.accProj.push(existingAccProj._id);
    } else {
      const newAccProj = await AccProj.create({
        ...accProjDetails,
        user: currentUser._id,
      });
      user.accProj.push(newAccProj._id);
    }

    await user.save();

    return existingAccProj || newAccProj;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accProj details');
  }
};


const putAccompPub = async (currentUser, accPubDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccPub = await AccPub.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accPubDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accPub) {
      user.accPub = [];
    }

    if (existingAccPub) {
      user.accPub.push(existingAccPub._id);
    } else {
      const newAccPub = await AccPub.create({
        ...accPubDetails,
        user: currentUser._id,
      });
      user.accPub.push(newAccPub._id);
    }

    await user.save();

    return existingAccPub || newAccPub;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accPub details');
  }
};


const putExternals = async (currentUser, externalDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingExternal = await External.findOneAndUpdate(
      { user: currentUser._id },
      { $set: externalDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.external) {
      user.external = [];
    }

    if (existingExternal) {
      user.external.push(existingExternal._id);
    } else {
      const newExternal = await External.create({
        ...externalDetails,
        user: currentUser._id,
      });
      user.external.push(newExternal._id);
    }

    await user.save();

    return existingExternal || newExternal;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating external details');
  }
};

const putExperience = async (currentUser, userSkillDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingUserSkill = await Experience.findOneAndUpdate(
      { user: currentUser._id },
      { $set: userSkillDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.userSkill) {
      user.userSkill = [];
    }

    if (existingUserSkill) {
      user.userSkill.push(existingUserSkill._id);
    } else {
      const newUserSkill = await Experience.create({
        ...userSkillDetails,
        user: currentUser._id,
      });
      user.userSkill.push(newUserSkill._id);
    }

    await user.save();

    return existingUserSkill || newUserSkill;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating userSkill details');
  }
};


const putAccompScore = async (currentUser, accTestScoreDetails) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const existingAccTestScore = await AccTestScore.findOneAndUpdate(
      { user: currentUser._id },
      { $set: accTestScoreDetails },
      { new: true, upsert: true }
    ).exec();

    if (!user.accTestScore) {
      user.accTestScore = [];
    }

    if (existingAccTestScore) {
      user.accTestScore.push(existingAccTestScore._id);
    } else {
      const newAccTestScore = await AccTestScore.create({
        ...accTestScoreDetails,
        user: currentUser._id,
      });
      user.accTestScore.push(newAccTestScore._id);
    }

    await user.save();

    return existingAccTestScore || newAccTestScore;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating accTestScore details');
  }
};


/*delete*/

const deleteOutlook = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await Education.findOneAndRemove({ user: currentUser._id }).exec();

    user.education = [];
    await user.save();

    return 'Education or outlook details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting Education or outlook details');
  }
};

/*if confused, the user.field is defined in the add section.*/

const deleteAbout = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.about = undefined; // Set 'about' field to undefined

    await user.save();

    return 'About field deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting user about');
  }
};



const deleteAccompOrg = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccompOrg.findOneAndRemove({ user: currentUser._id }).exec();

    user.accompOrg = [];
    await user.save();

    return 'Organization details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting Organization details');
  }
};


const deleteAccompCert = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccCert.findOneAndRemove({ user: currentUser._id }).exec();

    user.accCert = [];
    await user.save();

    return 'certificate details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting certificate details');
  }
};


const deleteAccompLang = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccLang.findOneAndRemove({ user: currentUser._id }).exec();

    user.accLang = [];
    await user.save();

    return 'language details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting language details');
  }
};


const deleteAccompAwrd = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccAwrd.findOneAndRemove({ user: currentUser._id }).exec();

    user.accAwrd = [];
    await user.save();

    return 'award details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting award details');
  }
};


const deleteAccompProj = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccProj.findOneAndRemove({ user: currentUser._id }).exec();

    user.accProj = [];
    await user.save();

    return 'project details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting project details');
  }
};


const deleteAccompPub = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccPub.findOneAndRemove({ user: currentUser._id }).exec();

    user.accPub = [];
    await user.save();

    return 'publication details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting publication details');
  }
};


const deleteExperience = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await Experience.findOneAndRemove({ user: currentUser._id }).exec();

    user.userSkill = [];
    await user.save();

    return 'skill or experience details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting skill or experience details');
  }
};


const deleteExternals = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await Externals.findOneAndRemove({ user: currentUser._id }).exec();

    user.external = [];
    await user.save();

    return 'externals details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting externals details');
  }
};



const deleteAccompScore = async (currentUser) => {
  try {
    const user = await User.findById(currentUser._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await AccTestScore.findOneAndRemove({ user: currentUser._id }).exec();

    user.accTestScore = [];
    await user.save();

    return 'Test score details deleted successfully';
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting test score details');
  }
};





module.exports = {
  createUser,
  createSchool,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
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
  deleteAccompScore,
  getSchoolById,
  getSchoolByEmail
};








