const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Post = require('../../models/userPost.post.model');
const PostVote = require('../../models/userPost.vote.model');
const Following = require('../../models/Following.model');
const Followers = require('../../models/Followers.model');
const Notification = require('../../models/Notification.model');
const socketHandler = require('../../handlers/socketHandler');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

const {
  retrieveComments,
  formatCloudinaryUrl,
  populatePostsPipeline,
} = require('../../utils/controllerUtils');


/*optional req.file*/

module.exports.createPost = async (req, res, next) => {
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





// module.exports.createPost = async (req, res, next) => {
//   const user = req.user;
//   const { caption } = req.body;
//   let post = undefined;
  
//   const hashtags = [];
//   linkify.find(caption).forEach((result) => {
//     if (result.type === 'hashtag') {
//       hashtags.push(result.value.substring(1));
//     }
//   });

//   let response; // Declare response variable outside the try-catch block

//   if (req.file) {
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });

//     try {
//       response = await cloudinary.uploader.upload(req.file.path);
//     } catch {
//       return next({ message: 'Error uploading image, please try again later.' });
//     }
//   }

//   try {
//     // Check if moderation is needed only when an image is provided
//     if (response) {
//       const moderationResponse = await axios.get(
//         `https://api.moderatecontent.com/moderate/?key=${process.env.MODERATECONTENT_API_KEY}&url=${response.secure_url}`
//       );

//       if (moderationResponse.data.error) {
//         return res
//           .status(500)
//           .send({ error: 'Error moderating image, please try again later.' });
//       }

//       if (moderationResponse.data.rating_index > 2) {
//         return res.status(403).send({
//           error: 'The content was deemed too explicit to upload.',
//         });
//       }
//     }

//     const thumbnailUrl = response
//       ? formatCloudinaryUrl(response.secure_url, { width: 400, height: 400 }, true)
//       : undefined;

//     if (response) {
//       fs.unlinkSync(req.file.path);
//     }

//     post = new Post({
//       attachment: response ? response.secure_url : undefined,
//       caption,
//       author: user._id,
//       hashtags,
//     });

//     const postVote = new PostVote({
//       post: post._id,
//     });

//     await post.save();
//     await postVote.save();

//     res.status(201).send({
//       ...post.toObject(),
//       postVotes: [],
//       comments: [],
//       author: { fullname: user.fullname, username: user.username },
//     });
//   } catch (err) {
//     next(err);
//   }
  
// try {
//   // Updating followers feed with post
//   const followersDocument = await Followers.find({ user: user._id });

//   if (followersDocument.length > 0) {
//     const followers = followersDocument[0].followers;
//     const postObject = {
//       ...post.toObject(),
//       author: { fullname: user.fullname, username: user.username },
//       commentData: { commentCount: 0, comments: [] },
//       postVotes: [],
//     };

//     followers.forEach((follower) => {
//       socketHandler.sendPost(req, postObject, follower.user);
//     });
//   } else {
//     console.log("No followers found for the user.");
//   }
// } catch (err) {
//   console.log(err);
// }
// };


module.exports.deletePost = async (req, res, next) => {
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

module.exports.retrievePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    // Retrieve the post and the post's votes
    const post = await Post.aggregate([
      { $match: { _id: ObjectId(postId) } },
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
      return res
        .status(404)
        .send({ error: 'Could not find a post with that id.' });
    }
    // Retrieve the comments associated with the post aswell as the comment's replies and votes
    const comments = await retrieveComments(postId, 0);

    return res.send({ ...post[0], commentData: comments });
  } catch (err) {
    next(err);
  }
};

module.exports.votePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

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
        
        const notification = new Notification({
          sender: user._id,
          receiver: post.author,
          notificationType: 'like',
          date: Date.now(),
          notificationData: {
            postId,
            
          },
        });

        await notification.save();
        socketHandler.sendNotification(req, {
          ...notification.toObject(),
          sender: {
            _id: user._id,
            fullname: user.fullname,
            username: user.username
            
          },
        });
      }
    }
    return res.send({ success: true });
  } catch (err) {
    next(err);
  }
};
module.exports.retrievePostFeed = async (req, res, next) => {
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


module.exports.retrieveSuggestedPosts = async (req, res, next) => {
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
      ...populatePostsPipeline,
    ]);
    return res.send(posts);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveHashtagPosts = async (req, res, next) => {
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

    return res.send(posts[0]);
  } catch (err) {
    next(err);
  }
};