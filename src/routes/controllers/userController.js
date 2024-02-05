const User = require('../../models/user.model');
const Post = require('../../models/userPost.post.model');
const Followers = require('../../models/Followers.model');
const Following = require('../../models/Following.model');
const Notification = require('../../models/Notification.model');
const accAwrd = require('../../models/accomp.awrd.model.js')
const accCert = require('../../models/accomp.cert.model.js')
const accLang = require('../../models/accomp.lang.model.js')
const accProj = require('../../models/accomp.proj.model.js')
const accPub = require('../../models/accomp.pub.model.js')
const accTestScore = require('../../models/accomp.score.model.js')
const accompOrg = require('../../models/accomp.org.model.js')
const Education = require('../../models/ed.model.js')
const External = require('../../models/externals.model.js')
const UserSkill = require('../../models/userSkill.model.js')
const socketHandler = require('../../handlers/socketHandler');
const ObjectId = require('mongoose').Types.ObjectId;
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const fs = require('fs');
const crypto = require('crypto');

const {
  validateEmail,
  validateFullName,
  validateUsername,
  validateBio,
  validateWebsite,
} = require('../../utils/user.validation');
// const { sendConfirmationEmail } = require('../utils/controllerUtils');

/*User retrieval alogothm goes here. might be implementing connection tree.*/

/*Temporary get creds.*/

/*Different schema divided.*/

/*Preview data page and referred requested data page.*/

module.exports.retrieveUser = async (req, res, next) => {
  /*id is more unique than full name*/
  const { username } = req.params;
  const requestingUser = req.user;

  try {
    const user = await User.findOne(
      { username: username }, // Use _id instead of username
      'fullname username email avatarPic backgroundPic about _id website location'
    );

    if (!user) {
      return res
        .status(404)
        .send({ error: 'Could not find a user with that ID.' });
    }

    const offset = req.query.offset || 0;

    const posts = await Post.aggregate([
      { $sort: { date: -1 } },
      { $skip: Number(offset) },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'user',
        },
      },
  {
    $match: { 'userInformation.username': username },
  },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'postvotes',
          localField: '_id',
          foreignField: 'post',
          as: 'postVotes',
        },
      },
      { $unwind: '$postVotes' },
      {
        $project: {
          attachment: true,
          caption: true,
          date: true,
          'user.fullname': true,
          'user.username': true,
          'user.avatarPic': true,
          comments: { $size: '$comments' },
          postVotes: { $size: '$postVotes.votes' },
        },
      },
    ]);

    // if (posts.length === 0) {
    //   return res.status(404).send({ error: 'Could not find any posts.' });
    // }

    const followersDocument = await Followers.findOne({
      user: ObjectId(user._id),
    });

    const followingDocument = await Following.findOne({
      user: ObjectId(user._id),
    });
    
const educationInformation = await Education.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
  },
  {
    $project: {
      schoolOrUniversity: true,
      degree: true,
      specialization: true,
      startYear: true,
      graduatedYear: true,
    },
  },
]);

    
    // if (educationInformation.length === 0) {
    //   return res.status(404).send({ error: 'Could not find any education information.' });
    // }
const AccomplishmentAward = await accAwrd.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
  },
  {
    $project: {
      title: true,
      associatedWith: true,
      issuer: true,
      date: true,
      desc: true,
      'userInformation.email': true,
    },
  },
]);


// return AccomplishmentAward.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in award(s).' })
//   : console.log('success');

const AccomplishmentCertification = await accCert.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
  },
  {
    $project: {
      CertName: true,
      CertAuthority: true,
      LicenseNum: true,
      expire: true,
      dateFrom: true,
      dateThen: true,
      LicenseUrl: true,
      'userInformation.email': true,
    },
  },
]);


// return AccomplishmentCertification.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in certification(s).' })
//   : console.log('success');


const AccomplishmentLanguage = await accLang.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
    },
  {
    $project: {
      language: true,
      proficiency: true,
      'userInformation.email': true,
    },
  },
]);

// return AccomplishmentLanguage.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in language(s).' })
//   : console.log('success');


const AccomplishmentOrganization = await accompOrg.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
    },
  {
    $project: {
      orgName: true,
      positionHeld: true,
      associatedCollegeEtc: true,
      current: true,
      dateFrom: true,
      dateThen: true,
      ongoing: true,
      description: true,
      'userInformation.email': true,
    },
  },
]);

// return AccomplishmentOrganization.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in organization(s).' })
//   : console.log('success');



const AccomplishmentProject = await accProj.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
    },
  {
    $project: {
      projectName: true,
      ongoingProject: true,
      dateNow: true,
      dateThen: true,
      associateName: true,
      associateWith: true,
      projectUrl: true,
      desc: true,
      'userInformation.email': true,
    },
  },
]);

// return AccomplishmentProject.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in project(s).' })
//   : console.log('success');


const AccomplishmentPublication = await accPub.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
    },
  {
    $project: {
      title: true,
      publisher: true,
      pubDate: true,
      authors: true,
      pubUrl: true,
      desc: true,
      'userInformation.email': true,
    },
  },
]);

// return AccomplishmentPublication.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in accPub.' })
//   : console.log('success');



const AccomplishmentTestScore = await accTestScore.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
    },
  {
    $project: {
      testName: true,
      associatedWith: true,
      score: true,
      testDate: true,
      desc: true,
      'userInformation.email': true,
    },
  },
]);

const userSkillInformation = await UserSkill.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
  },
  {
    $project: {
      skill: true,
      description: true,
    },
  },
]);


const externalInformation = await External.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.username': username },
  },
  {
    $project: {
      description: true,
      attachment: true,
    },
  },
]);



// return AccomplishmentTestScore.length === 0
//   ? res.status(404).send({ error: 'No information found for the given user in accTestScore.' })
//   : console.log('success');


return res.send({
  userInformation: user,
  followers: followersDocument ? followersDocument.followers.length : 0,
  following: followingDocument ? followingDocument.following.length : 0,
  isFollowing: requestingUser
    ? !!followersDocument.followers.find(
        (follower) => String(follower.user) === String(requestingUser._id)
      )
    : false,
  education: educationInformation,
  userSkillInformation: userSkillInformation,
  externalInformation: externalInformation,
  Accomplishment: {
    AccomplishmentAward: AccomplishmentAward,
    AccomplishmentCertification: AccomplishmentCertification,
    AccomplishmentLanguage: AccomplishmentLanguage,
    AccomplishmentOrganizationOrExperiences: AccomplishmentOrganization,
    AccomplishmentProject: AccomplishmentProject, // Missing comma here
    AccomplishmentPublication: AccomplishmentPublication,
    AccomplishmentTestScore: AccomplishmentTestScore
  },
  posts: posts,
  /**Show more background, etc.**/
});

  } catch (err) {
    next(err);
  }
};



/*Referred to post.*/


module.exports.retrievePosts = async (req, res, next) => {
  // Retrieve a user's posts with the post's comments & likes
  const { username, offset = 0 } = req.params;
  try {
    const posts = await Post.aggregate([
      { $sort: { date: -1 } },
      { $skip: Number(offset) },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'user',
        },
      },
  {
    $match: { 'userInformation.username': username },
  },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'postvotes',
          localField: '_id',
          foreignField: 'post',
          as: 'postVotes',
        },
      },
      { $unwind: '$postVotes' },
      {
        $project: {
          attachment: true,
          caption: true,
          date: true,
          'user.fullname': true,
          'user.username': true,
          'user.avatarPic': true,
          comments: { $size: '$comments' },
          postVotes: { $size: '$postVotes.votes' },
        },
      },
    ]);
    
    if (posts.length === 0) {
      return res.status(404).send({ error: 'Could not find any posts.' });
    }
    return res.send(posts);
  } catch (err) {
    next(err);
  }
};

/*later on*/

module.exports.bookmarkPost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .send({ error: 'Could not find a post with that id.' });
    }

    const userBookmarkUpdate = await User.updateOne(
      {
        _id: user._id,
        'bookmarks.post': { $ne: postId },
      },
      { $push: { bookmarks: { post: postId } } }
    );
    if (!userBookmarkUpdate.nModified) {
      if (!userBookmarkUpdate.ok) {
        return res.status(500).send({ error: 'Could not bookmark the post.' });
      }
      // The above query did not modify anything meaning that the user has already bookmarked the post
      // Remove the bookmark instead
      const userRemoveBookmarkUpdate = await User.updateOne(
        { _id: user._id },
        { $pull: { bookmarks: { post: postId } } }
      );
      if (!userRemoveBookmarkUpdate.nModified) {
        return res.status(500).send({ error: 'Could not bookmark the post.' });
      }
      return res.send({ success: true, operation: 'remove' });
    }
    return res.send({ success: true, operation: 'add' });
  } catch (err) {
    next(err);
  }
};

/*idParam is same as userId*/


// module.exports.followUser = async (req, res, next) => {
//   const { userId } = req.params;
//   const user = req.user;

//   try {
//     const userToFollow = await User.findById(userId);
//     if (!userToFollow) {
//       return res.status(400).send({ error: 'Could not find a user with that id.' });
//     }

//     const isFollowing = await Following.findOne({ user: userId, 'following.user': user._id });

//     if (isFollowing) {
//       // User is already following, so unfollow
//       await Followers.updateOne(
//         { user: userId },
//         { $pull: { followers: { user: user._id } } }
//       );

//       await Following.updateOne(
//         { user: user._id },
//         { $pull: { following: { user: userId } } }
//       );

//       return res.send({ success: true, operation: 'unfollow' });
//     }

//     // User is not following, so follow
//     await Followers.updateOne(
//       { user: userId },
//       { $push: { followers: { user: user._id } } },
//       { upsert: true }
//     );

//     await Following.updateOne(
//       { user: user._id },
//       { $push: { following: { user: userId } } },
//       { upsert: true }
//     );

//     const notification = new Notification({
//       notificationType: 'follow',
//       sender: user._id,
//       receiver: userId,
//       date: Date.now(),
//     });

//     const sender = await User.findById(user._id, 'firstName lastName avatarPic');

//     await notification.save();
//     // socketHandler.sendNotification(req, {
//     //   notificationType: 'follow',
//     //   sender: {
//     //     _id: sender._id,
//     //     firstName: sender.firstName,
//     //     lastName: sender.lastName,
//     //     avatarPic: sender.avatarPic,
//     //   },
//     //   receiver: userId,
//     //   date: notification.date,
//     //   isFollowing: true,
//     // });

//     res.send({ success: true, operation: 'follow' });
//   } catch (err) {
//     next(err);
//   }
// };


/*Fixing follow unfollow with the original code.*/
module.exports.followUser = async (req, res, next) => {
  const { userId } = req.params;
  const user = req.user;

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(400).send({ error: 'Could not find a user with that id.' });
    }

    const isFollowing = await Followers.findOne({
      user: userId,
      'followers.user': user._id,
    });

    if (isFollowing) {
      // User is already following, so unfollow
      await Followers.updateOne(
        { user: userId },
        { $pull: { followers: { user: user._id } } }
      );

      await Following.updateOne(
        { user: user._id },
        { $pull: { following: { user: userId } } }
      );

      return res.send({ success: true, operation: 'unfollow' });
    }

    // User is not following, so follow
    await Followers.updateOne(
      { user: userId },
      { $push: { followers: { user: user._id } } },
      { upsert: true }
    );

    await Following.updateOne(
      { user: user._id },
      { $push: { following: { user: userId } } },
      { upsert: true }
    );

    const notification = new Notification({
      notificationType: 'follow',
      sender: user._id,
      receiver: userId,
      date: Date.now(),
    });

    await notification.save();

    res.send({ success: true, operation: 'follow' });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Could not follow/unfollow user, please try again later.' });
  }
};




/**
 * Retrieves either who a specific user follows or who is following the user.
 * Also retrieves whether the requesting user is following the returned users
 * @function retrieveRelatedUsers
 * @param {object} user The user object passed on from other middlewares
 * @param {string} userId Id of the user to be used in the query
 * @param {number} offset The offset for how many documents to skip
 * @param {boolean} followers Whether to query who is following the user or who the user follows default is the latter
 * @returns {array} Array of users
 */
 
const retrieveRelatedUsers = async (user, userId, offset, followers) => {
  const pipeline = [
    {
      $match: { user: ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'users',
        let: followers
          ? { userId: '$followers.user' }
          : { userId: '$following.user' },
        pipeline: [
          {
            $match: {
              // Using the $in operator instead of the $eq
              // operator because we can't coerce the types
              $expr: { $in: ['$_id', '$$userId'] },
            },
          },
          {
            $skip: Number(offset),
          },
          {
            $limit: 10,
          },
        ],
        as: 'users',
      },
    },
    {
      $lookup: {
        from: 'followers',
        localField: 'users._id',
        foreignField: 'user',
        as: 'userFollowers',
      },
    },
    {
      $project: {
        'users._id': true,
        'users.fullname': true,
        'users.username': true,
        'users.avatarPic': true,
        userFollowers: true,
      },
    },
  ];

  const aggregation = followers
    ? await Followers.aggregate(pipeline)
    : await Following.aggregate(pipeline);

  // Make a set to store the IDs of the followed users
  const followedUsers = new Set();
  // Loop through every follower and add the id to the set if the user's id is in the array
  aggregation[0].userFollowers.forEach((followingUser) => {
    if (
      !!followingUser.followers.find(
        (follower) => String(follower.user) === String(user._id)
      )
    ) {
      followedUsers.add(String(followingUser.user));
    }
  });
  // Add the isFollowing key to the following object with a value
  // depending on the outcome of the loop above
  aggregation[0].users.forEach((followingUser) => {
    followingUser.isFollowing = followedUsers.has(String(followingUser._id));
  });

  return aggregation[0].users;
};

module.exports.retrieveFollowing = async (req, res, next) => {
  const { userId, offset = 0 } = req.params;
  const user = req.user;
  try {
    const users = await retrieveRelatedUsers(user, userId, offset);
    return res.send(users);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveFollowers = async (req, res, next) => {
  const { userId, offset = 0 } = req.params;
  const user = req.user;

  try {
    const users = await retrieveRelatedUsers(user, userId, offset, true);
    return res.send(users);
  } catch (err) {
    next(err);
  }
};


module.exports.searchUsers = async (req, res, next) => {
  const { username, offset = 0 } = req.params;
  if (!username) {
    return res.status(400).send({ error: 'Please provide a user to search for.' });
  }

  try {
   
    const users = await User.aggregate([
      {
        $match: {
          username: { $regex: new RegExp(username), $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'followers',
          localField: '_id',
          foreignField: 'user',
          as: 'followers',
        },
      },
      {
        $unwind: '$followers',
      },
      {
        $addFields: {
          followersCount: { $size: '$followers.followers' },
        },
      },
      {
        $sort: { followersCount: -1 },
      },
      {
        $skip: Number(offset),
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: true,
          fullname: true,
          username: true,
          avatarPic: true,
          about: true,
          location: true,
          // Add other fields you want to include
        },
      },
    ]);

    if (users.length === 0) {
      return res.status(404).send({ error: 'Could not find any users matching the criteria.' });
    }

    return res.send(users);
  } catch (err) {
    next(err);
  }
};



module.exports.confirmUser = async (req, res, next) => {
  const { token } = req.body;
  const user = req.user;

  try {
    const confirmationToken = await ConfirmationToken.findOne({
      token,
      user: user._id,
    });
    if (!confirmationToken) {
      return res
        .status(404)
        .send({ error: 'Invalid or expired confirmation link.' });
    }
    await ConfirmationToken.deleteOne({ token, user: user._id });
    await User.updateOne({ _id: user._id }, { confirmed: true });
    return res.send();
  } catch (err) {
    next(err);
  }
};

module.exports.changeAvatar = async (req, res, next) => {
  const user = req.user;

  if (!req.file) {
    return res
      .status(400)
      .send({ error: 'Please provide the image to upload.' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
      width: 200,
      height: 200,
      gravity: 'face',
      crop: 'thumb',
    });
    fs.unlinkSync(req.file.path);

    const avatarUpdate = await User.updateOne(
      { _id: user._id },
      { avatarPic: response.secure_url }
    );

    if (!avatarUpdate.nModified) {
      throw new Error('Could not update user avatar.');
    }

    return res.send({ avatar: response.secure_url });
  } catch (err) {
    next(err);
  }
};

module.exports.removeAvatar = async (req, res, next) => {
  const user = req.user;

  try {
    const avatarUpdate = await User.updateOne(
      { _id: user._id },
      { $unset: { avatarPic: '' } }
    );
    if (!avatarUpdate.nModified) {
      next(err);
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};



module.exports.changeBackgroundPic = async (req, res, next) => {
  const user = req.user;

  if (!req.file) {
    return res
      .status(400)
      .send({ error: 'Please provide the image to upload.' });
  }

/*backgroundPic*/

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
  width: 820,
  height: 312,
  crop: 'fill', // Use 'fill' to fill the specified dimensions
  gravity: 'auto', // Automatically determine the most important part of the image
});
    fs.unlinkSync(req.file.path);

    const backgroundPicUpdate = await User.updateOne(
      { _id: user._id },
      { backgroundPic: response.secure_url }
    );

    if (!backgroundPicUpdate.nModified) {
      throw new Error('Could not update user background.');
    }

    return res.send({ backgroundPic: response.secure_url });
  } catch (err) {
    next(err);
  }
};

module.exports.removeBackgroundPic = async (req, res, next) => {
  const user = req.user;

  try {
    const backgroundPicUpdate = await User.updateOne(
      { _id: user._id },
      { $unset: { backgroundPic: '' } }
    );
    if (!backgroundPicUpdate.nModified) {
      next(err);
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const user = req.user;
  const { website, about, email, location } = req.body;
  
  let updatedFields = {};
  try {
    const userDocument = await User.findOne({ _id: user._id });

    if (location) {
      // No validation for location
      userDocument.location = location;
      updatedFields.location = location;
    }

    if (website) {
      const websiteError = validateWebsite(website);
      if (websiteError) return res.status(400).send({ error: websiteError });
      if (!website.includes('http://') && !website.includes('https://')) {
        userDocument.website = 'https://' + website;
        updatedFields.website = 'https://' + website;
      } else {
        userDocument.website = website;
        updatedFields.website = website;
      }
    }

    if (about) {
      const bioError = validateBio(about);
      if (bioError) return res.status(400).send({ error: bioError });
      userDocument.bio = about;
      updatedFields.bio = about;
    }

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) return res.status(400).send({ error: emailError });
      // Make sure the email to update to is not the current one
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res
            .status(400)
            .send({ error: 'Please choose another email.' });

        userDocument.email = email;
        updatedFields = { ...updatedFields, email };
      }
    }
    const updatedUser = await userDocument.save();
    res.send(updatedFields);
  } catch (err) {
    next(err);
  }
};



module.exports.retrieveSuggestedUsers = async (req, res, next) => {
  const { max } = req.params;
  const user = req.user;
  try {
    
    const offset = req.query.offset || 0;
    
    const postsAgr = await Post.aggregate([
      { $sort: { date: -1 } },
      { $skip: Number(offset) },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'user',
        },
      },
  {
    $match: { 'user._id': mongoose.Types.ObjectId(user._id) },
  },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'postvotes',
          localField: '_id',
          foreignField: 'post',
          as: 'postVotes',
        },
      },
      { $unwind: '$postVotes' },
      {
        $project: {
          attachment: true,
          caption: true,
          date: true,
          'user.fullname': true,
          'user.username': true,
          'user.avatarPic': true,
          comments: { $size: '$comments' },
          postVotes: { $size: '$postVotes.votes' },
        },
      },
    ]);

    
    const users = await User.aggregate([
      {
        $match: { _id: { $ne: mongoose.Types.ObjectId(user._id) } },
      },
      {
        $lookup: {
          from: 'followers',
          localField: '_id',
          foreignField: 'user',
          as: 'followers',
        },
      },
      {
        $lookup: {
          from: 'posts',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$author', '$$userId'],
                },
              },
            },
            {
              $sort: { date: -1 },
            },
            {
              $limit: 3,
            },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'post',
                as: 'comments',
              },
            },
            {
              $lookup: {
                from: 'postvotes',
                localField: '_id',
                foreignField: 'post',
                as: 'postVotes',
              },
            },
            { $unwind: '$postVotes' },
            {
              $project: {
                attachment: true,
                caption: true,
                date: true,
                'user.fullname': true,
                'user.username': true,
                'user.avatarPic': true,
                comments: { $size: '$comments' },
                postVotes: { $size: '$postVotes.votes' },
              },
            },
          ],
          as: 'posts',
        },
      },
      {
        $addFields: {
          isFollowing: { $in: [mongoose.Types.ObjectId(user._id), '$followers.followers.user'] },
        },
      },
      {
        $match: { isFollowing: false },
      },
      {
        $unset: ['followers', 'isFollowing'],
      },
      {
        $project: {
          _id: true,
          fullname: true,
          userId: true,
          about: true,
          location: true,
          email: true,
          avatarPic: true,
          // posts: true,
        },
      },
      {
        $sample: { size: max ? Number(max) : 20 },
      },
    ]);

/*everything as expected for now.*/

    res.send({
      user: users,
      // posts: postsAgr
    });
  } catch (err) {
    next(err);
  }
};
