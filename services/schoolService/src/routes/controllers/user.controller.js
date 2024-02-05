const UserDesc = require('../../models/userdesc.model.js');
const User = require('../../models/user.model.js');
const UserCommit = require('../../models/usercommit.model.js');
const Post = require('../../models/userpost.model');
const Job = require('../../models/userjob.model');
const Event = require('../../models/userevent.model');
const Followers = require('../../models/followers.model');
const Following = require('../../models/following.model');
const Notification = require('../../models/notification.model');
const ObjectId = require('mongoose').Types.ObjectId;
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose')
// const {
//   validateEmail,
//   validateFullName,
//   validateUsername,
//   validateBio,
//   validateWebsite,
// } = require('../utils/validation');

{/*for school & company no unique identifier needed. already a validation for name. just for user.*/}

module.exports.retrieveUser = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
  const requestingUser = req.user;
  try {
    const user = await User.findOne(
      { schoolOrUniversityName },
      'schoolOrUniversityName avatarPic about location email _id phone website backgroundPic '
    );
    if (!user) {
      return res
        .status(404)
        .send({ error: 'Could not find a user with that username.' });
    }
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
          attachment: true,
          caption: true,
          date: true,
          'user.schoolOrUniversityName': true,
          'user.avatarPic': true,
          
        },
      },
    ]);
const jobs = await Job.aggregate([
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
      title: true,
      location: true,
      attachment: true,
      jobReq: true,
      numEmployee: true,
      typeofJob: true,
      urlApply: true,
      skillReq: true,
      caption: true,
      hashtags: true,
      datePosted: true,
      'user.schoolOrUniversityName': true,
      'user.avatarPic': true,
    },
      },
    ]);
    
const descriptions = await UserDesc.aggregate([
      { $sort: { date: -1 } },
      { $skip: Number(offset) },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users',
          localField: 'school',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
      description: true,
      website: true,
      typeOfIndustry: true,
      companySize: true,
      mainLocation: true,
      typeofOrg: true,
      specialities: true,
      'user.schoolOrUniversityName': true,
    },
      },
    ]);
    
const events = await Event.aggregate([
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
      title: true,
      attachment: true,
      url: true,
      eventDate: true,
      eventHour: true,
      locationOrPlatform: true,
      caption: true,
      hashtags: true,
      datePosted: true,
      'user.schoolOrUniversityName': true,
      'user.avatarPic': true,
    },
      },
    ]);
    
const commits = await UserCommit.aggregate([
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
      title: true,
      description: true,
      attachment: true,
      link: true,
      'user.schoolOrUniversityName': true,
    },
      },
    ]);

{/*avoid projecting same field.*/}

{/*need to add a follower to avoid null value.*/}

  const followersDocument = await Followers.findOne({
      user: ObjectId(user._id),
    });

    const followingDocument = await Following.findOne({
      user: ObjectId(user._id),
    });

  return res.send({
  user,
  // followers: followersDocument.followers.length > 0 ? followersDocument.followers.length : ["Not found"],
  // following: followingDocument.following.length > 0 ? followingDocument.following.length : ["Not found"],
  // isFollowing: requestingUser
  //   ? !!followersDocument.followers.find(
  //       (follower) => String(follower.user) === String(requestingUser._id)
  //     )
  //   : false,
  followers: followersDocument ? followersDocument.followers.length : 0,
  following: followingDocument ? followingDocument.following.length : 0,
  isFollowing: requestingUser
    ? !!followersDocument.followers.find(
        (follower) => String(follower.user) === String(requestingUser._id)
      )
    : false,
  etc: {
    jobs: jobs.length > 0 ? jobs : ["Not found"],
    descriptions: descriptions.length > 0 ? descriptions : ["Not found"],
    events: events.length > 0 ? events : ["Not found"],
    commits: commits.length > 0 ? commits : ["Not found"],
  },
  posts: posts,
});
  } catch (err) {
    next(err);
  }
};

module.exports.retrievePosts = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
          attachment: true,
          caption: true,
          date: true,
          'user.schoolOrUniversityName': true,
          'user.avatarPic': true,
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


module.exports.retrieveJobs = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
  try {
   const jobs = await Job.aggregate([
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
          title: true,
          location: true,
          attachment: true,
          jobReq: true,
          numEmployee: true,
          typeofJob: true,
          urlApply: true,
          skillReq: true,
          caption: true,
          hashtags: true,
          datePosted: true,
          'user.schoolOrUniversityName': true,
          'user.avatarPic': true,
        },
      },
    ]);
    if (jobs.length === 0) {
      return res.status(404).send({ error: 'Could not find any jobs.' });
    }
    return res.send(jobs);
  } catch (err) {
    next(err);
  }
};


module.exports.retrieveCommits = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
  try {
    
  // const commits = await UserCommit.aggregate([
  //     { $sort: { date: -1 } },
  //     { $skip: Number(offset) },
  //     { $limit: 12 },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'author',
  //         foreignField: '_id',
  //         as: 'user',
  //       },
  //     },
  //     { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
  //     {
  //       $project: {
  //         title: true,
  //         description: true,
  //         attachment: true,
  //         link: true,
  //         user: true,
  //         'user.schoolOrUniversityName': true,
  //       },
  //     },
  //   ]);
    
const commits = await UserCommit.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'school',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.schoolOrUniversityName': schoolOrUniversityName },
  },
   {
        $project: {
          title: true,
          description: true,
          attachment: true,
          link: true,
          school: true,
        },
      },
]);
    
    if (commits.length === 0) {
      return res.status(404).send({ error: 'Could not find any commits.' });
    }
    return res.send(commits);
  } catch (err) {
    next(err);
  }
};

{/*have some trouble here. no school ref in field.*/}

module.exports.retrieveDescriptions = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
  try {
    
    
    
const descriptions = await UserDesc.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'school',
      foreignField: '_id',
      as: 'userInformation',
    },
  },
  {
    $match: { 'userInformation.schoolOrUniversityName': schoolOrUniversityName },
  },
   {
      $project: {
        description: true,
        website: true,
        typeOfIndustry: true,
        companySize: true,
        mainLocation: true,
        typeofOrg: true,
        specialities: true,
        school: true,
        'user.schoolOrUniversityName': true,
      },
    },
]);
    
  // const descriptions = await UserDesc.aggregate([
  //   { $sort: { date: -1 } },
  //   { $skip: Number(offset) },
  //   { $limit: 12 },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'school',
  //       foreignField: '_id',
  //       as: 'user',
  //     },
  //   },
  //   { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
  //   {
  //     $project: {
  //       description: true,
  //       website: true,
  //       typeOfIndustry: true,
  //       companySize: true,
  //       mainLocation: true,
  //       typeofOrg: true,
  //       specialities: true,
  //       school: true,
  //       'user.schoolOrUniversityName': true,
  //     },
  //   },
  // ]);
    if (descriptions.length === 0) {
      return res.status(404).send({ error: 'Could not find any descriptions.' });
    }
    return res.send(descriptions);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveEvents = async (req, res, next) => {
  const { schoolOrUniversityName, offset = 0 } = req.params;
  try {
   const events = await Event.aggregate([
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
      { $match: { 'user.schoolOrUniversityName': schoolOrUniversityName } },
      {
        $project: {
          title: true,
          attachment: true,
          url: true,
          eventDate: true,
          eventHour: true,
          locationOrPlatform: true,
          caption: true,
          hashtags: true,
          author: true,
          datePosted: true,
          'user.schoolOrUniversityName': true,
          'user.avatarPic': true,
        },
      },
    ]);
    if (events.length === 0) {
      return res.status(404).send({ error: 'Could not find any events.' });
    }
    return res.send(events);
  } catch (err) {
    next(err);
  }
};


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

{/*the field contains user id which cam be retrieved by axios post in user service. and get all feed from this school service.*/}

{/*also in user service, need to register a username (unique identifier)*/}


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





// module.exports.followUser = async (req, res, next) => {
//   const { userId } = req.params;
//   const user = req.user;

//   try {
//     const userToFollow = await User.findById(userId);
//     if (!userToFollow) {
//       return res
//         .status(400)
//         .send({ error: 'Could not find a user with that id.' });
//     }

//     const followerUpdate = await Followers.updateOne(
//       { user: userId, 'followers.user': { $ne: user._id } },
//       { $push: { followers: { user: user._id } } }
//     );

//     const followingUpdate = await Following.updateOne(
//       { user: user._id, 'following.user': { $ne: userId } },
//       { $push: { following: { user: userId } } }
//     );

//     if (!followerUpdate.nModified || !followingUpdate.nModified) {
//       if (!followerUpdate.ok || !followingUpdate.ok) {
//         return res
//           .status(500)
//           .send({ error: 'Could not follow user please try again later.' });
//       }
//       // Nothing was modified in the above query meaning that the user is already following
//       // Unfollow instead
//       const followerUnfollowUpdate = await Followers.updateOne(
//         {
//           user: userId,
//         },
//         { $pull: { followers: { user: user._id } } }
//       );

//       const followingUnfollowUpdate = await Following.updateOne(
//         { user: user._id },
//         { $pull: { following: { user: userId } } }
//       );
//       if (!followerUnfollowUpdate.ok || !followingUnfollowUpdate.ok) {
//         return res
//           .status(500)
//           .send({ error: 'Could not follow user please try again later.' });
//       }
//       return res.send({ success: true, operation: 'unfollow' });
//     }

//     const notification = new Notification({
//       notificationType: 'follow',
//       sender: user._id,
//       receiver: userId,
//       date: Date.now(),
//     });

//     const isFollowing = await Following.findOne({
//       user: userId,
//       'following.user': user._id,
//     });

//     await notification.save();
//     res.send({ success: true, operation: 'follow' });
//   } catch (err) {
//     next(err);
//   }
// };

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
        'users.schoolOrUniversityName': true,
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
  const { schoolOrUniversityName, offset = 0 } = req.params;
  if (!schoolOrUniversityName) {
    return res
      .status(400)
      .send({ error: 'Please provide a school to search for.' });
  }

  try {
    const users = await User.aggregate([
      {
        $match: {
          schoolOrUniversityName: { $regex: new RegExp(schoolOrUniversityName), $options: 'i' },
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
          schoolOrUniversityName: true,
          avatarPic: true,
          location: true,
          about: true,
        },
      },
    ]);
    if (users.length === 0) {
      return res
        .status(404)
        .send({ error: 'Could not find any schools matching the criteria.' });
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

    return res.send({ avatarPic: response.secure_url });
  } catch (err) {
    next(err);
  }
};


module.exports.changeBackground = async (req, res, next) => {
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

    const backgroundUpdate = await User.updateOne(
      { _id: user._id },
      { backgroundPic: response.secure_url }
    );

    if (!backgroundUpdate.nModified) {
      throw new Error('Could not update user background.');
    }

    return res.send({ backgroundPic: response.secure_url });
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


module.exports.removeBackground = async (req, res, next) => {
  const user = req.user;

  try {
    const backgroundUpdate = await User.updateOne(
      { _id: user._id },
      { $unset: { backgroundPic: '' } }
    );
    if (!backgroundUpdate.nModified) {
      next(err);
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const user = req.user;
  const { schoolOrUniversityName, website, about, email, phone } = req.body;
  let updatedFields = {};
  try {
    const userDocument = await User.findOne({ _id: user._id });
/*no validation for now.*/
    if (schoolOrUniversityName) {
      userDocument.schoolOrUniversityName = schoolOrUniversityName;
      updatedFields.schoolOrUniversityName = schoolOrUniversityName;
    }

    if (website) {
      if (!website.includes('http://') && !website.includes('https://')) {
        userDocument.website = 'https://' + website;
        updatedFields.website = 'https://' + website;
      } else {
        userDocument.website = website;
        updatedFields.website = website;
      }
    }

    if (about) {
      userDocument.about = about;
      updatedFields.about = about;
    }

    if (email) {
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
    if (email && email !== user.email) {
    }
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
          'user.firstName': true,
          'user.lastName': true,
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
                'user.firstName': true,
                'user.lastName': true,
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
          schoolOrUniversityName: true,
          about: true,
          location: true,
          email: true,
          avatarPic: true,
          backgroundPic: true,
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




module.exports.addDesc = async (req, res) => {
  const { description, website, typeOfIndustry, companySize, mainLocation, typeofOrg, specialities } = req.body;

  try {
    const currentUser = req.user;
    const user = await User.findById(currentUser._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newUserDesc = new UserDesc({
      description,
      website,
      typeOfIndustry,
      companySize,
      mainLocation,
      typeofOrg,
      specialities,
      user: user._id,
    });

    await newUserDesc.save();

    return res.status(201).json({
      UserDesc: newUserDesc,
      UserD: user._id
    });  

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports.addCommit = async (req, res, next) => {
  const { title, description, link } = req.body;
  let response;

  try {
    const currentUser = req.user;
    const user = await User.findById(currentUser._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.file) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      try {
        response = await cloudinary.uploader.upload(req.file.path);
      } catch (error) {
        return next({ message: 'Error uploading image, please try again later.' });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    }

    const newCommit = new UserCommit({
      title,
      description,
      attachment: response ? response.secure_url : undefined,
      link,
      user: user._id,
    });

    await newCommit.save();

    return res.status(201).json({
      userCommit: {
        _id: newCommit._id,
        title: newCommit.title,
        description: newCommit.description,
        attachment: newCommit.attachment,
        link: newCommit.link,
        user: newCommit.user,
      },
      user: {
        _id: user._id,
        schoolOrUniversity: user.schoolOrUniversityName,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

