const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Event = require('../../../models/userevent.model');
const Following = require('../../../models/Following.model');
const Followers = require('../../../models/Followers.model');
const Notification = require('../../../models/Notification.model');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

const {
  formatCloudinaryUrl,
  populateEventsPipeline,
} = require('../../../utils/controllerUtils');


/*optional req.file*/

module.exports.createEvent = async (req, res, next) => {
  const user = req.user;
  const { title, attachment, url, eventDate, eventHour, locationOrPlatform, caption } = req.body;
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

    post = new Event({
      title,
      attachment: response ? response.secure_url : undefined,
      url,
      eventDate,
      eventHour,
      locationOrPlatform,
      caption,
      author: user._id
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


// module.exports.createEvent = async (req, res, next) => {
//   const user = req.user;
//   const { title, attachment, url, eventDate, eventHour, locationOrPlatform, caption } = req.body;
//   let event = undefined;
  
//   const hashtags = [];
//   linkify.find(caption).forEach((result) => {
//     if (result.type === 'hashtag') {
//       hashtags.push(result.value.substring(1));
//     }
//   });

//   let response; 
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

//     event = new Event({
//       title,
//       attachment: response ? response.secure_url : undefined,
//       url,
//       eventDate,
//       eventHour,
//       locationOrPlatform,
//       caption,
//       author: user._id
//     });

//     await event.save();

//     res.status(201).send({
//       ...event.toObject(),
//       author: { schoolOrUniversity: user.schoolOrUniversityName },
//     });
//   } catch (err) {
//     next(err);
//   }
  
// try {
//   // Updating followers feed with event
//   const followersDocument = await Followers.find({ user: user._id });

//   if (followersDocument.length > 0) {
//     const followers = followersDocument[0].followers;
//     const eventObject = {
//       ...event.toObject(),
//       author: { schoolOrUniversity: user.schoolOrUniversityName },
//     };
//   } else {
//     console.log("No followers found for the user.");
//   }
// } catch (err) {
//   console.log(err);
// }
// };


module.exports.deleteEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const user = req.user;

  try {
    const event = await Event.findOne({ _id: eventId, author: user._id });
    if (!event) {
      return res.status(404).send({
        error: 'Could not find a event with that id associated with the user.',
      });
    }
    // This uses pre hooks to delete everything associated with this event i.e comments
    const eventDelete = await Event.deleteOne({
      _id: eventId,
    });
    if (!eventDelete.deletedCount) {
      return res.status(500).send({ error: 'Could not delete the event.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }

  try {
    const followersDocument = await Followers.find({ user: user._id });
    const followers = followersDocument[0].followers;
  } catch (err) {
    console.log(err);
  }
};

module.exports.retrieveEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const event = await Event.aggregate([
      { $match: { _id: ObjectId(eventId) } },
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
    if (event.length === 0) {
      return res
        .status(404)
        .send({ error: 'Could not find a event with that id.' });
    }

    return res.send({ ...event[0] });
  } catch (err) {
    next(err);
  }
};


module.exports.retrieveEventFeed = async (req, res, next) => {
  const user = req.user;
  const { offset } = req.params;

  try {
    const followingDocument = await Following.findOne({ user: user._id });
    if (!followingDocument) {
      return res.status(404).send({ error: 'Could not find any events.' });
    }
    const following = followingDocument.following.map(
      (following) => following.user
    );

    // Fields to not include on the user object
    const unwantedUserFields = [
      'author.password',
      
      'author.email',
      
    ];

   const events = await Event.aggregate([
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
    return res.send(events);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveSuggestedEvents = async (req, res, next) => {
  const { offset = 0 } = req.params;

  try {
    const events = await Event.aggregate([
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
      ...populateEventsPipeline,
    ]);
    return res.send(events);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveHashtagEvents = async (req, res, next) => {
  const { hashtag, offset } = req.params;

  try {
    const events = await Event.aggregate([
      {
        $facet: {
          events: [
            {
              $match: { hashtags: hashtag },
            },
            {
              $skip: Number(offset),
            },
            {
              $limit: 20,
            },
            ...populateEventsPipeline,
          ],
          eventCount: [
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
        $unwind: '$eventCount',
      },
      {
        $addFields: {
          eventCount: '$eventCount.count',
        },
      },
    ]);

    return res.send(events[0]);
  } catch (err) {
    next(err);
  }
};
