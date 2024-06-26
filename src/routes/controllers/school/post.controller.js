const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Post = require('../../../models/userPost.post.model.js');
const Following = require('../../../models/Following.model');
const Followers = require('../../../models/Followers.model');
const Notification = require('../../../models/Notification.model');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const UserSkill = require('../../../models/userSkill.model')
const PostVote = require('../../../models/userPost.vote.model')
const {
  
  formatCloudinaryUrl,
  spopulatePostsPipeline,
} = require('../../../utils/controllerUtils');


/*optional req.file*/
module.exports.screatePost = async (req, res, next) => {
  const user = req.user;
  const { caption } = req.body;
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

    post = new Post({
      attachment: response ? response.secure_url : undefined,
      caption,
      author: user._id,
      hashtags,
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



module.exports.sdeletePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

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

module.exports.sretrievePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    // Retrieve the post and the post's votes
    const post = await Post.aggregate([
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
        
        ],
      },
    ]);
    if (post.length === 0) {
      return res
        .status(404)
        .send({ error: 'Could not find a post with that id.' });
    }

    return res.send({ ...post[0] });
  } catch (err) {
    next(err);
  }
};


module.exports.sretrievePostFeed = async (req, res, next) => {
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

   const posts = await Post.aggregate([
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

module.exports.sretrieveSuggestedPosts = async (req, res, next) => {
  const { offset = 0 } = req.params;

  try {
    const posts = await Post.aggregate([
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

module.exports.sretrieveHashtagPosts = async (req, res, next) => {
  const { hashtag, offset } = req.params;

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
            ...spopulatePostsPipeline,
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

    return res.send(posts[0]);
  } catch (err) {
    next(err);
  }
};
module.exports.sretrieveAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find({}).populate({
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
module.exports.sretrieveQueryPosts = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i');
    const matchedPosts = await Post.find({
      $or: [
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
module.exports.sretrievePostLoc = async (req, res) => {
  const user = req.user;
  const userloc = user.location;
  try {
    const regex = new RegExp(userloc, 'i');
   const matchedPosts = await Post.find({
      $or: [
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
module.exports.sretrievePostMatchBySkills = async (req, res) => {
  const user = req.user;
  try {
    const userSkills = await UserSkill.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          skill: 1,
          description: 1
        }
      }
    ]);
    const skills = userSkills.map(skillObj => skillObj.skill);
    const regex = new RegExp(skills.join('|'), 'i'); 
     const matchedPosts = await Post.find({
      $or: [
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
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
module.exports.votethispost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

  try {
    // Check if the user has already voted on the post
    const postVote = await PostVote.findOne({ post: postId, 'votes.author': user._id });

    if (postVote) {
      // User has already voted, so remove their vote
      const result = await PostVote.updateOne(
        { post: postId },
        { $pull: { votes: { author: user._id } } }
      );

      if (result.nModified > 0) {
        console.log('Successfully unliked the post');
        return res.send({ success: true, message: 'Unliked the post.' });
      } else {
        console.log('No like to remove');
        return res.send({ success: true, message: 'No like to remove.' });
      }
    } else {
      // User has not voted yet, so add their vote
      const result = await PostVote.updateOne(
        { post: postId },
        { $push: { votes: { author: user._id } } }
      );

      if (result.nModified > 0) {
        console.log('Successfully liked the post');
        // Sending a like notification should be implemented here
        return res.send({ success: true, message: 'Liked the post.' });
      } else {
        console.log('Failed to like the post');
        return res.status(500).send({ error: 'Could not vote on the post.' });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Could not vote on the post.', err: err });
  }
};