const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Job = require('../../models/userjob.model');
const Following = require('../../models/following.model');
const Followers = require('../../models/followers.model');
const Notification = require('../../models/notification.model');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

const {
  formatCloudinaryUrl,
  populateJobsPipeline,
} = require('../../utils/controllerUtils');


/*optional req.file*/
module.exports.createJob = async (req, res, next) => {
  const user = req.user;
  const { caption, title, location, jobReq, numEmployee, typeofJob, skillReq, aboutJob, urlApply } = req.body;
  let job = undefined;
  
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

    job = new Job({
      title,
      location,
      attachment: response ? response.secure_url : undefined,
      jobReq,
      numEmployee,
      typeofJob,
      skillReq,
      urlApply,
      caption,
      hashtags,
      author: user._id,
    });

    await job.save();

    res.status(201).send({
      ...job.toObject(),
      author: { schoolOrUniversity: user.schoolOrUniversityName },
    });
  } catch (err) {
    next(err);
  }
  
try {
  // Updating followers feed with job
  const followersDocument = await Followers.find({ user: user._id });
  if (followersDocument.length > 0) {
    const followers = followersDocument[0].followers;
    const jobObject = {
      ...job.toObject(),
      author: { schoolOrUniversity: user.schoolOrUniversityName },
    };
  } else {
    console.log("No followers found for the user.");
  }
} catch (err) {
  console.log(err);
}
};


module.exports.deleteJob = async (req, res, next) => {
  const { jobId } = req.params;
  const user = req.user;

  try {
    const job = await Job.findOne({ _id: jobId, author: user._id });
    if (!job) {
      return res.status(404).send({
        error: 'Could not find a job with that id associated with the school.',
      });
    }
    const jobDelete = await Job.deleteOne({
      _id: jobId,
    });
    if (!jobDelete.deletedCount) {
      return res.status(500).send({ error: 'Could not delete the job.' });
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

module.exports.retrievejob = async (req, res, next) => {
  const { jobId } = req.params;
  try {
    const job = await Job.aggregate([
      { $match: { _id: ObjectId(jobId) } },
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
    if (job.length === 0) {
      return res
        .status(404)
        .send({ error: 'Could not find a job with that id.' });
    }
    return res.send({ ...job[0] });
  } catch (err) {
    next(err);
  }
};


module.exports.retrieveJobFeed = async (req, res, next) => {
  const user = req.user;
  const { offset } = req.params;
  try {
    const followingDocument = await Following.findOne({ user: user._id });
    if (!followingDocument) {
      return res.status(404).send({ error: 'Could not find any jobs.' });
    }
    const following = followingDocument.following.map(
      (following) => following.user
    );
    const unwantedUserFields = [
      'author.password',
      'author.email',
    ];
   const jobs = await Job.aggregate([
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
    return res.send(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveSuggestedJobs = async (req, res, next) => {
  const { offset = 0 } = req.params;
  try {
    const jobs = await Job.aggregate([
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
      ...populateJobsPipeline,
    ]);
    return res.send(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveHashtagJobs = async (req, res, next) => {
  const { hashtag, offset } = req.params;
  try {
    const jobs = await Job.aggregate([
      {
        $facet: {
          jobs: [
            {
              $match: { hashtags: hashtag },
            },
            {
              $skip: Number(offset),
            },
            {
              $limit: 20,
            },
            ...populateJobsPipeline,
          ],
          jobCount: [
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
        $unwind: '$jobCount',
      },
      {
        $addFields: {
          jobCount: '$jobCount.count',
        },
      },
    ]);
    return res.send(jobs[0]);
  } catch (err) {
    next(err);
  }
};