const cloudinary = require('cloudinary').v2;
const linkify = require('linkifyjs');
const axios = require('axios');
require('linkify-plugin-hashtag')
const Job = require('../../../models/userjob.model');
const Following = require('../../../models/Following.model');
const Followers = require('../../../models/Followers.model');
const Notification = require('../../../models/Notification.model');
const AccCert = require('../../../models/accomp.cert.model')
const AccAwrd = require('../../../models/accomp.awrd.model')
const AccompOrg = require('../../../models/accomp.org.model')
const AccPub = require('../../../models/accomp.pub.model')
const AccProj = require('../../../models/accomp.proj.model')
const Education = require('../../../models/ed.model')
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const { fuzzyFilter } = require('fuzzbunny');
const UserSkill = require('../../../models/userSkill.model')
const {
  formatCloudinaryUrl,
  populateJobsPipeline,
} = require('../../../utils/controllerUtils');


/*optional req.file*/

module.exports.createJob = async (req, res, next) => {
  const user = req.user;
  const { caption, title, location, jobReq, numEmployee, typeofJob, skillReq, aboutJob, urlApply } = req.body;
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

    post = new Job({
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



// module.exports.createJob = async (req, res, next) => {
//   const user = req.user;
//   const { caption, title, location, jobReq, numEmployee, typeofJob, skillReq, aboutJob, urlApply } = req.body;
//   let job = undefined;
  
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

//     job = new Job({
//       title,
//       location,
//       attachment: response ? response.secure_url : undefined,
//       jobReq,
//       numEmployee,
//       typeofJob,
//       skillReq,
//       urlApply,
//       caption,
//       hashtags,
//       author: user._id,
//     });

//     await job.save();

//     res.status(201).send({
//       ...job.toObject(),
//       author: { schoolOrUniversity: user.schoolOrUniversityName },
//     });
//   } catch (err) {
//     next(err);
//   }
  
// try {
//   // Updating followers feed with job
//   const followersDocument = await Followers.find({ user: user._id });
//   if (followersDocument.length > 0) {
//     const followers = followersDocument[0].followers;
//     const jobObject = {
//       ...job.toObject(),
//       author: { schoolOrUniversity: user.schoolOrUniversityName },
//     };
//   } else {
//     console.log("No followers found for the user.");
//   }
// } catch (err) {
//   console.log(err);
// }
// };


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
          'author.mailbox',
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
module.exports.retrieveAllJobs = async (req, res) => {
  try {
    const allJobs = await Job.find({}).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    res.status(200).json({
      _status: 'success',
      data: allJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'error',
      _error: err.message
    });
  }
}
module.exports.retriveQueryJobs = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i');
    const matchedJobs = await Job.find({
       $or: [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { jobReq: { $regex: regex } },
        { numEmployee: { $regex: regex } },
        { typeofJob: { $regex: regex } },
        { urlApply: { $regex: regex } },
        { caption: { $regex: regex } },
        { 'skillReq': { $regex: regex } }
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
      data: matchedJobs
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
module.exports.retrieveJobLoc = async (req, res) => {
  const user = req.user;
  const userloc = user.location;
  try {
    const regex = new RegExp(userloc, 'i');
    const matchedJobs = await Job.find({
      $or: [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { jobReq: { $regex: regex } },
        { numEmployee: { $regex: regex } },
        { typeofJob: { $regex: regex } },
        { urlApply: { $regex: regex } },
        { caption: { $regex: regex } },
        { 'skillReq': { $regex: regex } }
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
      data: matchedJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'BAD',
      _error: err.message
    });
  }
}
module.exports.retrieveJobAbt = async (req, res) => {
  const user = req.user;
  const userloc = user.about;
  try {
    const regex = new RegExp(userloc, 'i');
    const matchedJobs = await Job.find({
      $or: [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { jobReq: { $regex: regex } },
        { numEmployee: { $regex: regex } },
        { typeofJob: { $regex: regex } },
        { urlApply: { $regex: regex } },
        { caption: { $regex: regex } },
        { 'skillReq': { $regex: regex } }
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
      data: matchedJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'BAD',
      _error: err.message
    });
  }
}
module.exports.retrieveJobMatchBySkills = async (req, res) => {
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
    const matchedJobs = await Job.find({
      $or: [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { jobReq: { $regex: regex } },
        { numEmployee: { $regex: regex } },
        { typeofJob: { $regex: regex } },
        { urlApply: { $regex: regex } },
        { caption: { $regex: regex } },
        { 'skillReq': { $regex: regex } }
      ]
    }).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about'
    });
    res.status(200).json({
      _status: 'SUCCESS',
      _regex: regex,
      data: matchedJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
//module.exports.matchjobsbyAttach = async (req, res) => {
//   const user = req.user;
//   try {
//     const userCert = await AccCert.find({ user: user._id });
//     const userAwrd = await AccAwrd.find({ user: user._id });
//     const userOrgs = await AccompOrg.find({ user: user._id });
//     const userProj = await AccProj.find({ user: user._id });
//     const userPubs = await AccPub.find({ user: user._id });
//     const certRegex = userCert.length > 0 ? userCert.map(cert => `(${cert.CertName}|${cert.CertAuthority})`).join('|') : null;
//     const awrdRegex = userAwrd.length > 0 ? userAwrd.map(obj => `(${obj.title}|${obj.associatedWith})`).join('|') : null;
//     const orgRegex = userOrgs.length > 0 ? userOrgs.map(obj => `(${obj.orgName}|${obj.positionHeld}|${obj.associatedCollegeEtc}|${obj.description})`).join('|') : null;
//     const projRegex = userProj.length > 0 ? userProj.map(obj => `(${obj.projectName}|${obj.desc})`).join('|') : null;
//     const pubRegex = userPubs.length > 0 ? userPubs.map(obj => `(${obj.title}|${obj.publisher}|${obj.desc})`).join('|') : null;
//     console.log(awrdRegex)
//     console.log(userAwrd)
//     const matchedCert = certRegex ? await Job.find({
//       $or: [
//         { title: { $regex: certRegex, $options: 'i' } },
//         { location: { $regex: certRegex, $options: 'i' } },
//         { jobReq: { $regex: certRegex, $options: 'i' } },
//         { numEmployee: { $regex: certRegex, $options: 'i' } },
//         { typeofJob: { $regex: certRegex, $options: 'i' } },
//         { urlApply: { $regex: certRegex, $options: 'i' } },
//         { caption: { $regex: certRegex, $options: 'i' } },
//         { 'skillReq': { $regex: certRegex, $options: 'i' } }
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     }) : null;
//     const matchedAwrd = awrdRegex ? await Job.find({
//       $or: [
//         { title: { $regex: awrdRegex, $options: 'i' } },
//         { location: { $regex: awrdRegex, $options: 'i' } },
//         { jobReq: { $regex: awrdRegex, $options: 'i' } },
//         { numEmployee: { $regex: awrdRegex, $options: 'i' } },
//         { typeofJob: { $regex: awrdRegex, $options: 'i' } },
//         { urlApply: { $regex: awrdRegex, $options: 'i' } },
//         { caption: { $regex: awrdRegex, $options: 'i' } },
//         { skillReq: { $in: [awrdRegex] } },
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     }) : null;
//     const matchedOrgs = orgRegex ? await Job.find({
//       $or: [
//         { title: { $regex: orgRegex, $options: 'i' } },
//         { location: { $regex: orgRegex, $options: 'i' } },
//         { jobReq: { $regex: orgRegex, $options: 'i' } },
//         { numEmployee: { $regex: orgRegex, $options: 'i' } },
//         { typeofJob: { $regex: orgRegex, $options: 'i' } },
//         { urlApply: { $regex: orgRegex, $options: 'i' } },
//         { caption: { $regex: orgRegex, $options: 'i' } },
//         { 'skillReq': { $regex: orgRegex, $options: 'i' } }
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     }) : null;
//     const matchedProjs = projRegex ? await Job.find({
//       $or: [
//         { title: { $regex: projRegex, $options: 'i' } },
//         { location: { $regex: projRegex, $options: 'i' } },
//         { jobReq: { $regex: projRegex, $options: 'i' } },
//         { numEmployee: { $regex: projRegex, $options: 'i' } },
//         { typeofJob: { $regex: projRegex, $options: 'i' } },
//         { urlApply: { $regex: projRegex, $options: 'i' } },
//         { caption: { $regex: projRegex, $options: 'i' } },
//         { 'skillReq': { $regex: projRegex, $options: 'i' } }
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     }) : null;
//     const matchedPubs = pubRegex ? await Job.find({
//       $or: [
//         { title: { $regex: pubRegex, $options: 'i' } },
//         { location: { $regex: pubRegex, $options: 'i' } },
//         { jobReq: { $regex: pubRegex, $options: 'i' } },
//         { numEmployee: { $regex: pubRegex, $options: 'i' } },
//         { typeofJob: { $regex: pubRegex, $options: 'i' } },
//         { urlApply: { $regex: pubRegex, $options: 'i' } },
//         { caption: { $regex: pubRegex, $options: 'i' } },
//         { 'skillReq': { $regex: pubRegex, $options: 'i' } }
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     }) : null;
//     res.status(200).send({
//       _status: 'SUCCESS',
//       _regex: {
//         awrdregex: awrdRegex,
//       },
//       _thiscred: {
//         cert: userCert.length > 0 ? userCert : null,
//         awrd: userAwrd.length > 0 ? userAwrd : null,
//         org: userOrgs.length > 0 ? userOrgs : null,
//         proj: userProj.length > 0 ? userProj : null,
//         pub: userPubs.length > 0 ? userPubs : null,
//       },
//       _fromcert: matchedCert,
//       _fromawrd: matchedAwrd,
//       _fromorg: matchedOrgs,
//       _fromproj: matchedProjs,
//       _frompub: matchedPubs,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       _STATUS: 'BAD',
//       _ERR: err
//     });
//   }
// }
// module.exports.matchjobsbyAttach = async (req, res) => {
//   const user = req.user;
//   try {
//     const userSkills = await AccAwrd.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           title: 1,
//           desc: 1
//         }
//       }
//     ]);
//     const skills = userSkills.map(skillObj => skillObj.title);
//     const regex = new RegExp(skills.join('|'), 'i'); 
//     const matchedJobs = await Job.find({
//       $or: [
//         { title: { $regex: regex } },
//         { location: { $regex: regex } },
//         { jobReq: { $regex: regex } },
//         { numEmployee: { $regex: regex } },
//         { typeofJob: { $regex: regex } },
//         { urlApply: { $regex: regex } },
//         { caption: { $regex: regex } },
//         { skillReq: { $regex: regex } }
//       ]
//     }).populate({
//       path: 'author',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });

//     res.status(200).json({
//       _status: 'SUCCESS',
//       _title: skills,
//       data: matchedJobs
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       _STATUS: 'BAD',
//       _ERR: err.message || 'Internal server error'
//     });
//   }
// }
const fuzz = require('fuzzball'); 
{/*this code is work, but i'm afraid it's returning all the data that is not relecant, so maybe i will shortage by limit from highest to lowest by 25, 100 being the perfect match till 70.
  the good thing is, i tried with unrelated job, and it doesnt appear (score 0?). work with other schema, return in one array var.
*/}
module.exports.matchjobsbyAttach = async (req, res) => {
  const user = req.user;
  try {
    const userSkills = await AccAwrd.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          desc: 1,
          associatedWith: 1
        }
      }
    ]);
    const skills = userSkills.map(skillObj => skillObj.title);
    const skillsDesc = userSkills.map(skillObj => skillObj.desc);
    const skillsAssociate = userSkills.map(skillObj => skillObj.associatedWith);
    const allJobs = await Job.find({}).populate({
      path: 'author',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const matchedJobs = [];
    skills.forEach(skill => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(skill, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ skill, job, field, score });
            }
          }
        });
      });
    });
    skillsDesc.forEach(desc => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(desc, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ desc, job, field, score });
            }
          }
        });
      });
    });
    skillsAssociate.forEach(associatedWith => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(associatedWith, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ associatedWith, job, field, score });
            }
          }
        });
      });
    });
    {/*from other Schema*/}
    const userSkills0 = await AccCert.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          CertName: 1,
        }
      }
    ]);
    const skills0 = userSkills0.map(skillObj => skillObj.CertName);
    skills0.forEach(CertName => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(CertName, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ CertName, job, field, score });
            }
          }
        });
      });
    });
     {/*from other Schema*/}
    const userSkills1 = await AccompOrg.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          orgName: 1,
          positionHeld: 1,
          associatedCollegeEtc: 1,
          description: 1,
        }
      }
    ]);
    const skillsOrgName = userSkills1.map(skillObj => skillObj.orgName);
    const skillsOrgPositionHeld = userSkills1.map(skillObj => skillObj.positionHeld);
    const skillsOrgAssoCollege = userSkills1.map(skillObj => skillObj.associatedCollegeEtc);
    const skillsOrgDesc = userSkills1.map(skillObj => skillObj.description);
    skillsOrgName.forEach(orgName => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(orgName, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ orgName, job, field, score });
            }
          }
        });
      });
    });
    skillsOrgPositionHeld.forEach(positionHeld => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(positionHeld, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ positionHeld, job, field, score });
            }
          }
        });
      });
    });
    skillsOrgAssoCollege.forEach(associatedCollegeEtc => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(associatedCollegeEtc, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ associatedCollegeEtc, job, field, score });
            }
          }
        });
      });
    });
    skillsOrgDesc.forEach(description => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(description, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ description, job, field, score });
            }
          }
        });
      });
    });
      {/*from other Schema*/}
    const userSkills2 = await AccProj.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          projectName: 1,
          associateName: 1,
          associateWith: 1,
          desc: 1,
        }
      }
    ]);
    const skillsProjName = userSkills2.map(skillObj => skillObj.projectName);
    const skillsProjAssocName = userSkills2.map(skillObj => skillObj.associateName);
    const skillsProjAssocWith = userSkills2.map(skillObj => skillObj.associateWith);
    const skillsProjDesc = userSkills2.map(skillObj => skillObj.desc);
    skillsProjName.forEach(projectName => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(projectName, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ projectName, job, field, score });
            }
          }
        });
      });
    });
    skillsProjAssocName.forEach(associateName => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(associateName, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ associateName, job, field, score });
            }
          }
        });
      });
    });
    skillsProjAssocWith.forEach(associateWith => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(associateWith, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ associateWith, job, field, score });
            }
          }
        });
      });
    });
    skillsProjDesc.forEach(desc => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(desc, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ desc, job, field, score });
            }
          }
        });
      });
    });
    {/*from other Schema*/}
    const userSkills3 = await AccPub.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          desc: 1,
        }
      }
    ]);
    const skillsPubTitle = userSkills3.map(skillObj => skillObj.title);
    const skillsPubDesc = userSkills3.map(skillObj => skillObj.desc);
    skillsPubTitle.forEach(title => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(title, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ title, job, field, score });
            }
          }
        });
      });
    });
    skillsPubDesc.forEach(desc => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(desc, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ desc, job, field, score });
            }
          }
        });
      });
    });
    
    
    
    
    
     const userEdu = await Education.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 0,
          schoolOrUniversity: 1,
          degree: 1,
          specialization: 1
        }
      }
    ]);
    const eduname = userEdu.map(skillObj => skillObj.schoolOrUniversity);
    const edudegree = userEdu.map(skillObj => skillObj.degree);
    const eduspec = userEdu.map(skillObj => skillObj.specialization);
 
    eduname.forEach(schoolOrUniversity => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(schoolOrUniversity, field);
          if (score >= 60) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ schoolOrUniversity, job, field, score });
            }
          }
        });
      });
    });
    edudegree.forEach(degree => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(degree, field);
          if (score >= 65) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ degree, job, field, score });
            }
          }
        });
      });
    });
    eduspec.forEach(specialization => {
      allJobs.forEach(job => {
        const jobFields = [job.caption, job.title, job.location, job.jobReq, job.numEmployee, job.typeofJob, job.skillReq.join(', '), job.author.about, job.urlApply];
        jobFields.forEach(field => {
          const score = fuzz.partial_ratio(specialization, field);
          if (score >= 70) {
            const isMatched = matchedJobs.some(match => match.job._id === job._id);
            if (!isMatched) {
              matchedJobs.push({ specialization, job, field, score });
            }
          }
        });
      });
    });
    {/*from other Schema*/}
    res.status(200).json({
      _status: 'SUCCESS',
      _matchedJobs: matchedJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
};
module.exports.jobnetbyabout = async (req, res) => {
  const user = req.user;
  const userabt = user.about;
  try {
    const regex = new RegExp(userabt, 'i');
    const matchedUsers = await Job.find({
      $or: [
        { title: regex },
        { location: regex },
        { jobReq: regex },
        { numEmployee: regex },
        { typeofJob: regex },
        { urlApply: regex },
        { caption: regex },
        { 'skillReq': regex }
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    res.status(200).json({
      _status: 'SUCCESS',
      data: matchedUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      _status: 'BAD',
      _error: err.message
    });
  }
};