const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Following = require('../../../models/Following.model');
const Followers = require('../../../models/Followers.model');
const Notification = require('../../../models/Notification.model');
const News = require('../../../models/usernews.model');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const UserSkill = require('../../../models/userSkill.model')
const {
  formatCloudinaryUrl,
  spopulatePostsPipeline,
} = require('../../../utils/controllerUtils');


/*optional req.file*/
module.exports.sscreatePost = async (req, res, next) => {
  const user = req.user;
  const { title, caption, url,   } = req.body;
  let post = undefined;

  const hashtags = [];
  linkify.find(caption).forEach((result) => {
    if (result.type === 'hashtag') {
      hashtags.push(result.value.substring(1));
    }
  });

  let response;

  if (req.file) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      response = await cloudinary.uploader.upload(req.file.path);
    } catch {
      return next({ message: 'Error uploading image, please try again later.' });
    }
  }

  try {
    if (response) {
      const moderationResponse = await axios.get(
        `https://api.moderatecontent.com/moderate/?key=${process.env.MODERATECONTENT_API_KEY}&url=${response.secure_url}`
      );

      if (moderationResponse.data.error) {
        return res
          .status(500)
          .send({ error: 'Error moderating image, please try again later.' });
      }

      if (moderationResponse.data.rating_index > 2) {
        return res.status(403).send({
          error: 'The content was deemed too explicit to upload.',
        });
      }
    }

    const thumbnailUrl = response
      ? formatCloudinaryUrl(response.secure_url, { width: 400, height: 400 }, true)
      : undefined;

    if (response) {
      fs.unlinkSync(req.file.path);
    }

    post = new News({
      title,
      attachment: response ? response.secure_url : undefined,
      url,
      
      caption,
      hashtags,
      author: user._id,
    });

    await post.save();

    res.status(201).send({
      ...post.toObject(),
      author: { avatar: user.avatarPic, username: user.username, SchoolOrUniversity : user.schoolOrUniversityName },
    });
  } catch (err) {
    next(err);
  }

  try {
    // Updating followers feed with post
    const followersDocument = await Followers.find({ user: user._id });

    if (followersDocument.length > 0) {
      const followers = followersDocument[0].followers;
      const postObject = {
        ...post.toObject(),
        author: { username: user.username, avatar: user.avatarPic, SchoolOrUniversity: user.schoolOrUniversityName },
      };

      followers.forEach((follower) => {
        socketHandler.sendPost(req, postObject, follower.user);
      });
    } else {
      console.log("No followers found for the user.");
    }
  } catch (err) {
    console.log(err);
  }
};



module.exports.ssdeletePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

  try {
    const post = await News.findOne({ _id: postId, author: user._id });
    if (!post) {
      return res.status(404).send({
        error: 'Could not find a post with that id associated with the user.',
      });
    }
    // This uses pre hooks to delete everything associated with this post i.e comments
    const postDelete = await News.deleteOne({
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

module.exports.ssretrievePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    // Retrieve the post and the post's votes
     const post = await News.aggregate([
      { $match: { _id: ObjectId(postId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $unset: [
          'author.password',
          'author.email',
          'author.mailbox',
        ],
      },
    ]);
    if (post.length === 0) {
      return res
        .status(404)
        .send({ error: `Could not find a post with that id. ${post} ${postId}` });
    }
    console.log(post + postId)
    return res.send({ ...post[0] });
  } catch (err) {
    next(err);
  }
};


module.exports.ssretrievePostFeed = async (req, res, next) => {
  const user = req.user;
  const { offset } = req.params;

  try {
    const followingDocument = await Following.findOne({ user: user._id });
    if (!followingDocument) {
      return res.status(404).send({ error: 'Could not find any posts.' });
    }
    const following = followingDocument.following.map(
      (following) => following.user
    );

    // Fields to not include on the user object
    const unwantedUserFields = [
      'author.password',
      
      'author.email',
      
    ];

   const posts = await News.aggregate([
  {
    $match: {
      $or: [{ author: { $in: following } }, { author: ObjectId(user._id) }],
    },
  },
  { $sort: { date: -1 } },
  { $skip: Number(offset) },
  { $limit: 5 },
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  },
  {
    $unwind: '$author',
  },
  {
    $unset: unwantedUserFields,
  },
]);
    return res.send(posts);
  } catch (err) {
    next(err);
  }
};

module.exports.ssretrieveSuggestedPosts = async (req, res, next) => {
  const { offset = 0 } = req.params;

  try {
    const posts = await News.aggregate([
      {
        $sort: { date: -1 },
      },
      {
        $skip: Number(offset),
      },
      {
        $limit: 20,
      },
      {
        $sample: { size: 20 },
      },
      ...spopulatePostsPipeline,
    ]);
    return res.send(posts);
  } catch (err) {
    next(err);
  }
};

module.exports.ssretrieveHashtagPosts = async (req, res, next) => {
  const { hashtag } = req.params;

  try {
   const posts = await News.find({ hashtags: { $in: hashtag } })
      .populate('author', 'username fullname schoolOrUniversityName avatarPic about location ') 
      .sort({ date: -1 }) 
      .exec();

    const count = posts.length; // Count of retrieved documents

    return res.send({ count, posts }); // Sending count along with the posts
  } catch (err) {
    next(err);
  }
};
module.exports.ssretrieveAllPosts = async (req, res) => {
  try {
    const allPosts = await News.find({}).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    res.status(200).json({
      _status: 'success',
      data: allPosts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'error',
      _error: err.message
    });
  }
}
module.exports.ssretrieveQueryPosts = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i');
    const matchedPosts = await News.find({
      $or: [
        { title: { $regex: regex } },
        { caption: { $regex: regex } },
        { hashtags: { $in: [regex] } },
      ]
    }).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
      match: {
        $or: [
          { username: { $regex: regex } },
          { fullname: { $regex: regex } },
          { schoolOrUniversityName: { $regex: regex } },
          { location: { $regex: regex } },
          { about: { $regex: regex } },
        ]
      }
    });
    res.status(200).json({
      _status: 'success',
      data: matchedPosts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'error',
      _error: err.message,
      _query: query
    });
  }
}
module.exports.ssretrievePostLoc = async (req, res) => {
  const user = req.user;
  const userloc = user.location;
  try {
    const regex = new RegExp(userloc, 'i');
   const matchedPosts = await News.find({
      $or: [
        { title: { $regex: regex } },
        { caption: { $regex: regex } },
        { hashtags: { $in: [regex] } },
      ]
    }).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
      match: {
        $or: [
          { username: { $regex: regex } },
          { fullname: { $regex: regex } },
          { schoolOrUniversityName: { $regex: regex } },
          { location: { $regex: regex } },
          { about: { $regex: regex } },
        ]
      }
    });
    res.status(200).json({
      _status: 'SUCCESS',
      data: matchedPosts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'BAD',
      _error: err.message
    });
  }
}
// module.exports.sretrievePostMatchBySkills = async (req, res) => {
//   const user = req.user;
//   try {
//     const userSkills = await UserSkill.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           skill: 1,
//           description: 1
//         }
//       }
//     ]);
//     const skills = userSkills.map(skillObj => skillObj.skill);
//     const regex = new RegExp(skills.join('|'), 'i'); 
//     const matchedPosts = await Post.find({
//       $or: [
//         { caption: { $regex: regex } },
//         { hashtags: { $in: [regex] } },
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//       match: {
//         $or: [
//           { username: { $regex: regex } },
//           { fullname: { $regex: regex } },
//           { schoolOrUniversityName: { $regex: regex } },
//           { location: { $regex: regex } },
//           { about: { $regex: regex } },
//         ]
//       }
//     });
//     res.status(200).json({
//       _status: 'SUCCESS',
//       data: matchedPosts
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       _STATUS: 'BAD',
//       _ERR: err
//     });
//   }
// }
