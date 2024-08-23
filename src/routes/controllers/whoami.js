const Education = require('../../models/ed.model')
const AccAwrd = require('../../models/accomp.awrd.model.js')
const AccCert = require('../../models/accomp.cert.model.js')
const AccLang = require('../../models/accomp.lang.model.js')
const AccompOrg = require('../../models/accomp.org.model.js')
const AccProj = require('../../models/accomp.proj.model.js')
const AccPub = require('../../models/accomp.pub.model.js')
const AccTestScore = require('../../models/accomp.score.model.js')
const External = require('../../models/externals.model.js')
const UserSkill = require('../../models/userSkill.model.js')
const Post = require('../../models/userPost.post.model')
const Job = require('../../models/userjob.model')
const Event = require('../../models/userevent.model')
const News = require('../../models/usernews.model')
const User = require('../../models/user.model')
const Comment = require('../../models/userPost.comment.model')
const Followers = require('../../models/Followers.model')
const Following = require('../../models/Following.model')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
module.exports.whoami = async (req, res) => {
  const user = req.user;
  let name;
  if (user.role === "user") {
    name = user.fullname;
  } else if (user.role === "school") {
    name = user.schoolOrUniversityName;
  }
  const dataToSend = {
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    email: user.email,
    name: name,
    username: user.username,
    phone: user.phone,
    location: user.location,
    about: user.about,
    _id: user._id,
    avatarPic: user.avatarPic,
    backgroundPic: user.backgroundPic
  };

  try {
    const ed = await Education.aggregate([
  {
    $match: {
      user: mongoose.Types.ObjectId(user._id)
    }
  },
  {
    $project: {
      schoolOrUniversity: 1,
      degree: 1,
      specialization: 1,
      startYear: 1,
      graduatedYear: 1,
      user: 1
    }
  }
]).exec();
    
   const awrd = await AccAwrd.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        title: 1,
        associatedWith: 1,
        issuer: 1,
        date: 1,
        desc: 1,
        user: 1
      }
    }
  ]).exec();
 
const cert = await AccCert.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        CertName: 1,
        CertAuthority: 1,
        LicenseNum: 1,
        expire: 1,
        dateFrom: 1,
        dateThen: 1,
        LicenseUrl: 1,
        user: 1
      }
    }
  ]).exec();


 const org = await AccompOrg.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        orgName: 1,
        positionHeld: 1,
        associatedCollegeEtc: 1,
        current: 1,
        dateFrom: 1,
        dateThen: 1,
        ongoing: 1,
        description: 1,
        user: 1
      }
    }
  ]).exec();


const lang = await AccLang.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        language: 1,
        proficiency: 1,
        user: 1
      }
    }
  ]).exec();


const proj = await AccProj.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        projectName: 1,
        ongoingProject: 1,
        dateNow: 1,
        dateThen: 1,
        associateName: 1,
        associateWith: 1,
        projectUrl: 1,
        desc: 1,
        user: 1
      }
    }
  ]).exec();


 const pub = await AccPub.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        title: 1,
        publisher: 1,
        pubDate: 1,
        authors: 1,
        pubUrl: 1,
        desc: 1,
        user: 1
      }
    }
  ]).exec();

 const score = await AccTestScore.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        testName: 1,
        associatedWith: 1,
        score: 1,
        testDate: 1,
        desc: 1,
        user: 1
      }
    }
  ]).exec();



 const external = await External.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        description: 1,
        attachment: 1,
        user: 1
      }
    }
  ]).exec();


 const skill = await UserSkill.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    {
      $project: {
        skill: 1,
        description: 1,
        user: 1
      }
    }
  ]).exec();


    res.status(200).send({
      _STATUS: "OK",
      _DATA: dataToSend,
      ed: ed,
      awrd: awrd,
      cert: cert,
      proj: proj,
      pub: pub,
      org: org,
      lang: lang,
      score: score,
      external: external,
      skill: skill
      
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _STATUS: "BAD",
      _ERRLOG: err
    });
  }
};
module.exports.retrievepostmy = async (req, res) => {
  const user = req.user;
  try {
    const posts = await Post.aggregate([
      {
        $match: {
          author: mongoose.Types.ObjectId(user._id)
        }
      },
      {
        $project: {
          caption: 1,
          attachment: 1,
          hashtags: 1,
          date: 1,
          author: 1
        }
      },
      {
        $sort: {
          date: -1 // Sort by date in descending order (newest first)
        }
      }
    ]);

    // Extracting author IDs from the posts
    const authorIds = posts.map(post => post.author);

    // Fetching authors information
    const authors = await User.find({ _id: { $in: authorIds } })
      .select('username fullname schoolOrUniversityName location avatarPic about');

    // Mapping author information to posts
    const postsWithAuthors = posts.map(post => {
      const author = authors.find(author => author._id.equals(post.author));
      return { ...post, author };
    });

    res.status(200).send({
      data: postsWithAuthors
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
module.exports.changeGeneral = async (req, res) => {
  const user = req.user;
  const { username, fullname, about, location } = req.body;
  try {
    if (username) user.username = username;
    if (fullname) user.fullname = fullname;
    if (about) user.about = about;
    if (location) user.location = location;
    await user.save();
    res.status(200).send({
      message: 'User updated successfully',
      user: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: 'Internal server error',
      log: err
    });
  }
};
module.exports.changeAttachment = async (req, res) => {
  const user = req.user;
  const operation = req.query.operation;
  const itemId = req.query.id; 
  let Model;

  try {
    switch (operation) {
      case 'Ed':
        Model = Education;
        break;
      case 'Awrd':
        Model = AccAwrd;
        break;
      case 'cert':
        Model = AccCert;
        break;
      case 'org':
        Model = AccompOrg;
        break;
      case 'lang':
        Model = AccLang;
        break;
      case 'proj':
        Model = AccProj;
        break;
      case 'pub':
        Model = AccPub;
        break;
      case 'score':
        Model = AccTestScore;
        break;
      case 'external':
        Model = External;
        break;
      case 'skill':
        Model = UserSkill;
        break;
      default:
        return res.status(400).send({
          message: 'Invalid operation'
        });
    }

    const items = await Model.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(user._id),
          _id: mongoose.Types.ObjectId(itemId)
        }
      },
      {
        $project: {
          ...getProjection(operation),
          user: 1
        }
      }
    ]);

    if (items.length === 0) {
      return res.status(404).send({
        message: `${operation === 'Ed' ? 'Education' : 'Award'} not found for this user`
      });
    }

    let item = items[0]; 

    
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (item.hasOwnProperty(key)) {
          item[key] = req.body[key];
        }
      });
    }

    await Model.findOneAndUpdate({ _id: itemId }, item);

    res.status(200).send({
      data: item
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: 'Internal server error'
    });
  }
}

function getProjection(operation) {
  switch (operation) {
    case 'Ed':
      return {
        schoolOrUniversity: 1,
        degree: 1,
        specialization: 1,
        startYear: 1,
        graduatedYear: 1
      };
    case 'Awrd':
      return {
        title: 1,
        associatedWith: 1,
        issuer: 1,
        date: 1,
        desc: 1
      };
    case 'cert':
      return {
        CertName: 1,
        CertAuthority: 1,
        LicenseNum: 1,
        expire: 1,
        dateFrom: 1,
        dateThen: 1,
        LicenseUrl: 1,
        user: 1
      };
    case 'org':
      return {
        orgName: 1,
        positionHeld: 1,
        associatedCollegeEtc: 1,
        current: 1,
        dateFrom: 1,
        dateThen: 1,
        ongoing: 1,
        description: 1,
        user: 1
      };
    case 'lang':
      return {
        language: 1,
        proficiency: 1,
        user: 1
      };
    case 'proj':
      return {
        projectName: 1,
        ongoingProject: 1,
        dateNow: 1,
        dateThen: 1,
        associateName: 1,
        associateWith: 1,
        projectUrl: 1,
        desc: 1,
        user: 1
      };
    case 'pub':
      return {
        title: 1,
        publisher: 1,
        pubDate: 1,
        authors: 1,
        pubUrl: 1,
        desc: 1,
        user: 1
      };
    case 'score':
      return {
        testName: 1,
        associatedWith: 1,
        score: 1,
        testDate: 1,
        desc: 1,
        user: 1
      };
    case 'external':
      return {
        description: 1,
        attachment: 1,
        user: 1
      };
    case 'skill':
      return {
        skill: 1,
        description: 1,
        user: 1
      };
    default:
      return {};
  }
}
module.exports.addAttachment = async (req, res) => {
  const user = req.user;
  const operation = req.query.operation;
  let Model;

  try {
    switch (operation) {
      case 'Ed':
        Model = Education;
        break;
      case 'Awrd':
        Model = AccAwrd;
        break;
      case 'cert':
        Model = AccCert;
        break;
      case 'org':
        Model = AccompOrg;
        break;
      case 'lang':
        Model = AccLang;
        break;
      case 'proj':
        Model = AccProj;
        break;
      case 'pub':
        Model = AccPub;
        break;
      case 'score':
        Model = AccTestScore;
        break;
      case 'external':
        Model = External;
        break;
      case 'skill':
        Model = UserSkill;
        break;
      default:
        return res.status(400).send({
          message: 'Invalid operation'
        });
    }
    
    if (!Model) {
      return res.status(400).send({
        message: 'Invalid operation'
      });
    }

    for (const key in req.body) {
      if (!req.body[key] || req.body[key].trim() === '') {
        return res.status(400).send({
          message: `${key} cannot be null or an empty string`
        });
      }
    }

    const newItem = new Model({
      ...req.body,
      user: user._id
    });

    await newItem.save();

    res.status(200).send({
      data: newItem
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: 'Internal server error'
    });
  }
}
module.exports.deleteAttachment = async (req, res) => {
  const user = req.user;
  const operation = req.query.operation;
  const itemId = req.query.id; 
  let Model;

  try {
    switch (operation) {
      case 'Ed':
        Model = Education;
        break;
      case 'Awrd':
        Model = AccAwrd;
        break;
      case 'cert':
        Model = AccCert;
        break;
      case 'org':
        Model = AccompOrg;
        break;
      case 'lang':
        Model = AccLang;
        break;
      case 'proj':
        Model = AccProj;
        break;
      case 'pub':
        Model = AccPub;
        break;
      case 'score':
        Model = AccTestScore;
        break;
      case 'external':
        Model = External;
        break;
      case 'skill':
        Model = UserSkill;
        break;
      default:
        return res.status(400).send({
          message: 'Invalid operation'
        });
    }
    
    if (!Model) {
      return res.status(400).send({
        message: 'Invalid operation'
      });
    }

    if (!itemId) {
      return res.status(400).send({
        message: 'Item ID is required'
      });
    }

    const item = await Model.findOne({
      _id: itemId,
      user: user._id
    });

    if (!item) {
      return res.status(404).send({
        message: `${operation === 'Ed' ? 'Education' : 'Award'} not found for this user`
      });
    }

    await Model.deleteOne({ _id: itemId });

    res.status(200).send({
      message: `${operation === 'Ed' ? 'Education' : 'Award'} deleted successfully`
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: 'Internal server error'
    });
  }
}
module.exports.uploadAvatar = async (req, res, next) => {
  const user = req.user;
  if (!req.file) {
    return res
      .status(400)
      .send({ error: 'Please provide the image to upload.' });
  }
  cloudinary.config({
    cloud_name: 'dfiernykr',
    api_key: '423216966891983',
    api_secret: '4cFZ5aVmUmtu3SZdLCD4zQZcvM8',
  });
  let response; // Declare response variable here
  try {
    response = await cloudinary.uploader.upload(req.file.path);
  } catch {
    return next({ message: 'Error uploading image, please try again later.' });
  }
  try {
    fs.unlinkSync(req.file.path);
    user.avatarPic = response.secure_url;
    await user.save();
    res.status(201).send({
      avatar: user.avatarPic
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err
    });
  }
}
module.exports.uploadBackground = async (req, res, next) => {
  const user = req.user;
  if (!req.file) {
    return res
      .status(400)
      .send({ error: 'Please provide the image to upload.' });
  }
  cloudinary.config({
    cloud_name: 'dfiernykr',
    api_key: '423216966891983',
    api_secret: '4cFZ5aVmUmtu3SZdLCD4zQZcvM8',
  });
  let response; // Declare response variable here
  try {
    response = await cloudinary.uploader.upload(req.file.path);
  } catch {
    return next({ message: 'Error uploading image, please try again later.' });
  }
  try {
    fs.unlinkSync(req.file.path);
    user.backgroundPic = response.secure_url;
    await user.save();
    res.status(201).send({
      avatar: user.backgroundPic
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err
    });
  }
}
module.exports.threadIds = async (req, res) => {
  const { threadId } = req.params;
  try {
    const comment = await Comment.findById(threadId)
  .populate({
    path: 'author',
    select: 'username fullname schoolOrUniversityName avatarPic about location' 
  });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports.wwvtag = async (req, res, next) => {
  const { hashtag } = req.params;
  try {
    const posts = await Post.find({ hashtags: { $in: hashtag } })
      .populate('author', 'username fullname schoolOrUniversityName avatarPic about location ') 
      .sort({ date: -1 }) 
      .exec();

    const count = posts.length; // Count of retrieved documents

    return res.send({ count, posts }); // Sending count along with the posts
  } catch (err) {
    next(err);
  }
};const { validationResult } = require('express-validator');

const performSearch = async (Model, query, populateFields) => {
  const searchResult = await Model.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).populate('user', populateFields);

  return searchResult;
};
const performSearchpost = async (Model, query, populateFields) => {
  const regexQuery = new RegExp(query, 'i'); 
  const searchResult = await Model.find(
    {
      $or: [
        { caption: { $regex: regexQuery } },
        { 'hashtags': { $in: [regexQuery] } } // Match hashtags array
      ]
    }
  )
  .populate('author', populateFields)
  .sort({ date: -1 }); // Sort by date in descending order

  return searchResult;
};
const performSearchjobs = async (Model, query, populateFields) => {
  const regexQuery = new RegExp(query, 'i');
  const searchResult = await Model.find({
    $or: [
      { title: { $regex: regexQuery } },
      { location: { $regex: regexQuery } },
      { jobReq: { $regex: regexQuery } },
      { numEmployee: { $regex: regexQuery } },
      { typeofJob: { $regex: regexQuery } },
      { urlApply: { $regex: regexQuery } },
      { skillReq: { $in: [regexQuery] } }, // Match skillReq array
      { caption: { $regex: regexQuery } },
      { hashtags: { $in: [regexQuery] } } // Match hashtags array
    ]
  }).populate('author', populateFields).sort({ date: -1 });
  return searchResult;
};
const performSearchEvents = async (Model, query, populateFields) => {
  const regexQuery = new RegExp(query, 'i');
  const searchResult = await Model.find({
    $or: [
      { title: { $regex: regexQuery } },
      { locationOrPlatform: { $regex: regexQuery } },
      { caption: { $regex: regexQuery } },
      { hashtags: { $in: [regexQuery] } } // Match hashtags array
    ]
  }).populate('author', populateFields).sort({ date: -1 });
  return searchResult;
};
const performSearchNews = async (Model, query, populateFields) => {
  const regexQuery = new RegExp(query, 'i');
  const searchResult = await Model.find({
    $or: [
      { title: { $regex: regexQuery } },
      { caption: { $regex: regexQuery } },
      { hashtags: { $in: [regexQuery] } } // Match hashtags array
    ]
  }).populate('author', populateFields).sort({ date: -1 });
  return searchResult;
};
module.exports.querysearch = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { option, query } = req.query;

    if (option === 'people') {
      // Limit fields to fetch initially
      const genUsers = await User.find(
        {
          $or: [
            { username: { $regex: query, $options: 'i' } }, 
            { fullname: { $regex: query, $options: 'i' } }, 
            { schoolOrUniversityName: { $regex: query, $options: 'i' } }, 
            { about: { $regex: query, $options: 'i' } }, 
            { location: { $regex: query, $options: 'i' } }, 
          ]
        },
        // Only fetch necessary fields
        'username fullname schoolOrUniversityName about location avatarPic'
      );

      // Fetch related documents for each user in parallel
      const allRelatedDocumentsPromises = genUsers.map(async (user) => {
        const relatedDocumentsPromises = [
          Education.findOne({ user: user._id }).lean().exec(), 
          AccAwrd.findOne({ user: user._id }).lean().exec(), 
          AccCert.findOne({ user: user._id }).lean().exec(), 
          AccProj.findOne({ user: user._id }).lean().exec(), 
          AccPub.findOne({ user: user._id }).lean().exec(), 
          AccLang.findOne({ user: user._id }).lean().exec(), 
          UserSkill.findOne({ user: user._id }).lean().exec(), 
          External.findOne({ user: user._id }).lean().exec(), 
          AccompOrg.findOne({ user: user._id }).lean().exec(), 
          AccTestScore.findOne({ user: user._id }).lean().exec(), 
        ];
        return Promise.all(relatedDocumentsPromises);
      });

      // Resolve all promises
      const allRelatedDocuments = await Promise.all(allRelatedDocumentsPromises);

      // Combine genUsers with related documents
      const data = genUsers.map((user, index) => ({
        user: user,
        relatedDocuments: allRelatedDocuments[index]
      }));

      res.status(200).send({
        queryoption: option,
        query: query,
        data: data
      });
    } else if (option === 'attachment') {
      const populateFields = 'username fullname avatarPic schoolOrUniversityName about location';
      const attAwrd = await performSearch(AccAwrd, query, populateFields);
     const attCert = await performSearch(AccCert, query, populateFields);
    const attProj = await performSearch(AccProj, query, populateFields);
    const attPub = await performSearch(AccPub, query, populateFields);
    const attOrg = await performSearch(AccompOrg, query, populateFields);
    const attEdu = await performSearch(Education, query, populateFields);
   // const attLang = await performSearch(AccLang, query, populateFields);
      const attSkill = await performSearch(UserSkill, query, populateFields);
      const attExt = await performSearch(External, query, populateFields);
      const attTest = await performSearch(AccTestScore, query, populateFields);

      res.status(200).send({
        queryoption: option,
        query: query,
        data: {
          awrd: attAwrd,
          cert: attCert,
          project: attProj,
          skill: attSkill,
         // lang: attLang,
          test: attTest,
          edu: attEdu,
          org: attOrg,
          pub: attPub,
          external: attExt,
        }
      });
    } else if (option === "post") {
      const populateFields = 'username fullname avatarPic schoolOrUniversityName about location';
      const posts = await performSearchpost(Post, query, populateFields);
      const jobs = await performSearchjobs(Job, query, populateFields);
      const events = await performSearchEvents(Event, query, populateFields);
      const news = await performSearchNews(News, query, populateFields);
      res.status(200).send({
        option: option,
        query: query,
        data: {
          posts: posts,
         jobs: jobs,
          events: events,
          news: news
        }
      })
    } else if (option === "tags") {
  const tags = Array.isArray(query) ? query : [query];
  const regexPattern = new RegExp(tags.join('|'), 'i');

  try {
    const posts = await Post.find({ hashtags: { $regex: regexPattern } })
      .populate({
        path: 'author',
        select: '-email -password -phone -backgroundPic -mailbox'
      });
    const count = posts.length;
    res.status(200).send({
      posts: posts,
      total: count
    });
  } catch (error) {
    console.error('Error searching for posts:', error);
    res.status(500).send('Internal Server Error');
  }
} else {
      
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Internal server error' });
  }
};
module.exports.werewolf = async (req, res) => {
  const { who } = req.query;
  if (!who) {
    return res.status(400).json({ message: "Missing 'who' parameter in the query" });
  }
  try {
    const user = await User.findOne(
      { username: who },
      { mailbox: 0, password: 0 }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
   const ed = await Education.find({ user: user._id }).sort({ date: -1 });
const posts = await Post.find({ author: user._id })
    .sort({ date: -1 })
    .populate({
        path: 'author',
        select: '-email -password -phone'
    });
const awrd = await AccAwrd.find({ user: user._id }).sort({ date: -1 });
const cert = await AccCert.find({ user: user._id }).sort({ date: -1 });
const project = await AccProj.find({ user: user._id }).sort({ date: -1 });
const lang = await AccLang.find({ user: user._id }).sort({ date: -1 });
const pub = await AccPub.find({ user: user._id }).sort({ date: -1 });
const org = await AccompOrg.find({ user: user._id }).sort({ date: -1 });
const test = await AccTestScore.find({ user: user._id }).sort({ date: -1 });
const external = await External.find({ user: user._id }).sort({ date: -1 });
const skill = await UserSkill.find({ user: user._id }).sort({ date: -1 });
    res.status(200).json({ 
      user: user,
      education: ed,
      awrd: awrd,
      cert: cert,
      project: project,
      lang: lang,
      pub: pub,
      org: org,
      test: test,
      external: external,
      skill: skill,
      posts: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
module.exports.postOverview = async (req, res) => {
  const user = req.user;
  const { limit } = req.query;

  try {
    const posts = await Post.find({ author: user._id })
                            .limit(parseInt(limit))
                            .sort({ date: -1 }); 

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
}
module.exports.getFollowers = async (req, res) => {
  const { targetId } = req.params;
  
  try {
    // Find the Followers document by targetId
    const followersData = await Followers.findOne({ user: targetId }).populate('followers.user', 'username avatarPic fullname schoolOrUniversityName');  // Populate followers' user details

    if (!followersData) {
      return res.status(404).json({ message: 'Followers not found' });
    }

    // Extract the followers list
    const followersList = followersData.followers.map(follower => {
  const user = follower.user;
  return {
    userId: user._id,
    username: user.username,
    avatarPic: user.avatarPic,
    name: user.fullname || user.schoolOrUniversityName,  // Use fullname or schoolOrUniversityName
  };
});

    // Get the total number of followers
    const totalFollowers = followersList.length;

    res.status(200).json({ followers: followersList, totalFollowers });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports.getFollowing = async (req, res) => {
  const { targetId } = req.params;
  
  try {
    // Find the Followers document by targetId
    const followersData = await Following.findOne({ user: targetId }).populate('following.user', 'username avatarPic fullname schoolOrUniversityName');  // Populate followers' user details

    if (!followersData) {
      return res.status(404).json({ message: 'Followers not found' });
    }

    // Extract the followers list
    const followersList = followersData.following.map(follower => {
  const user = follower.user;
  return {
    userId: user._id,
    username: user.username,
    avatarPic: user.avatarPic,
    name: user.fullname || user.schoolOrUniversityName,  // Use fullname or schoolOrUniversityName
  };
});

    // Get the total number of followers
    const totalFollowers = followersList.length;

    res.status(200).json({ following: followersList, totalFollowers });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};