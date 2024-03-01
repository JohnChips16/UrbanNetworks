const Education = require('../../../models/ed.model')
const ObjectId = require('mongoose').Types.ObjectId;
const Post = require('../../../models/userPost.post.model.js');
const Event = require('../../../models/userevent.model.js');
const Job = require('../../../models/userjob.model');
const AccCert = require('../../../models/accomp.cert.model')
const AccAwrd = require('../../../models/accomp.awrd.model')
const AccompOrg = require('../../../models/accomp.org.model')
const AccPub = require('../../../models/accomp.pub.model')
const Skill = require('../../../models/userSkill.model')
const User = require('../../../models/user.model.js');
// module.exports.networkAlumni = async (req, res) => {
//     const user = req.user;
//     try {
//         const userSchools = await Education.aggregate([
//             { $match: { user: user._id } },
//             { $project: { _id: 0, schoolOrUniversity: 1, description: 1 } }
//         ]);

//         // Extract schools from userSchools
//         const schools = userSchools.map(obj => obj.schoolOrUniversity);

//         // Find alumni with exact matching schools
//         const matchedAlumni = await Education.find({
//             schoolOrUniversity: { $in: schools }
//         }).populate({
//             path: 'user',
//             select: 'username fullname schoolOrUniversityName location avatarPic about',
//             match: {
//                 $or: [
//                     { username: { $in: schools } },
//                     { fullname: { $in: schools } },
//                     { schoolOrUniversityName: { $in: schools } },
//                     { location: { $in: schools } },
//                     { about: { $in: schools } },
//                 ]
//             }
//         });

//         // Respond with matched alumni
//         res.status(200).json({
//             alumni: matchedAlumni,
//         });
//     } catch (err) {
//         console.error('Error in networkAlumni:', err);
//         res.status(500).json({
//             _STATUS: 'BAD',
//             _ERR: err.message
//         });
//     }
// };
module.exports.networkAlumni = async (req, res) => {
    const user = req.user;
    try {
        const userSchools = await Education.aggregate([
            { $match: { user: user._id } },
            { $project: { _id: 0, schoolOrUniversity: 1,
            description: 1 } }
        ]);

        // Extract schools from userSchools
        const schools = userSchools.map(obj => obj.schoolOrUniversity);

        // Find alumni with exact matching schools
        const matchedAlumni = await Education.find({
            schoolOrUniversity: { $in: schools }
        }).populate({
            path: 'user',
            select: 'username fullname schoolOrUniversityName location avatarPic about'
        });

        // Respond with matched alumni
        res.status(200).json({
            alumni: matchedAlumni,
        });
    } catch (err) {
        console.error('Error in networkAlumni:', err);
        res.status(500).json({
            _STATUS: 'BAD',
            _ERR: err.message
        });
    }
 };
module.exports.networkAlumniByDegreeSpec = async (req, res) => {
    const user = req.user;
    try {
        const userSchools = await Education.aggregate([
            { $match: { user: user._id } },
            { $project: { _id: 0, schoolOrUniversity: 1, degree: 1, specialization: 1, description: 1 } }
        ]);

        // Extract schools from userSchools
        const schools = userSchools.map(obj => obj.schoolOrUniversity);
        const degrees = userSchools.map(obj => obj.degree);
        const specializations = userSchools.map(obj => obj.specialization);

        // Find alumni with the same schoolOrUniversity and matching degree or specialization
        const matchedAlumni = await Education.find({
            $and: [
                { schoolOrUniversity: { $in: schools } },
                {
                    $or: [
                        { $and: [{ degree: { $in: degrees } }, { schoolOrUniversity: { $in: schools } }] },
                        { $and: [{ specialization: { $in: specializations } }, { schoolOrUniversity: { $in: schools } }] }
                    ]
                }
            ]
        }).populate({
            path: 'user',
            select: 'username fullname schoolOrUniversityName location avatarPic about'
        });

        // Respond with matched alumni
        res.status(200).json({
            alumni: matchedAlumni,
        });
    } catch (err) {
        console.error('Error in networkAlumni:', err);
        res.status(500).json({
            _STATUS: 'BAD',
            _ERR: err.message
        });
    }
};
//router.get('/urb/network/matchby/thisalumni', auth('school'), networkThisAlumni)
//router.get('/urb/network/applicant/matchby/thispost', auth('school'), applicantByPost)
//router.get('/urb/network/applicant/matchby/thisevent', auth('school'), applicantByEvent)
//router.get('/urb/network/applicant/matchby/thisjob', auth('school'), applicantByJob)
//router.get('/urb/network/applicant/matchby/themAccs', auth('school'), applicantByThemAccs)
//router.get('/urb/network/applicant/matchby/themAbout', auth('school'), applicantByThemAbout)
//router.get('/urb/network/applicant/matchby/themEdDegree', auth('school'), applicantByThemEducationDegree)
//router.get('/urb/network/applicant/matchby/themSkills', auth('school'), applicantByThemSkills)
{/*this algorithm basically
1. set the point to compare or matching
2. using the schema fields to match with that point.*/}
const fuzz = require('fuzzball');
module.exports.networkThisAlumni = async (req, res) => {
  const school = req.user;
  const univName = school.schoolOrUniversityName;
  try {
    const allEdsUser = await Education.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
    const matchedUserEds = [];
    allEdsUser.forEach(Ed => {
      const edFields = [Ed.schoolOrUniversity, Ed.degree, Ed.specialization];
      edFields.forEach(field => {
        const score = fuzz.partial_ratio(univName, field);
        if (score >= 70) {
          const isMatched = matchedUserEds.some(match => match.Ed._id === Ed._id);
          if (!isMatched) {
            matchedUserEds.push({ univName, Ed, field, score });
          }
        }
      });
    });
    res.status(200).send({
      _STATUS: 'OK',
      _DATA: matchedUserEds
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
module.exports.applicantByPost = async (req, res) => {
  const school = req.user;
  try {
  const postsCaption = await Post.find({ author: school._id }, 'caption');
const allUsers = await User.find({});
const allEdsUser = await Education.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
const matchedUserEds = [];
allUsers.forEach(user => {
    const userAbout = user.about;
    postsCaption.forEach(post => {
        const postCaption = post.caption;
        const score = fuzz.partial_ratio(postCaption, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postCaption, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    postsCaption.forEach(post => {
        const postCaption = post.caption;
        const scoreDegree = fuzz.partial_ratio(postCaption, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postCaption, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postCaption, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postCaption, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});
res.status(200).send({
      _STATUS: 'OK',
      _DATA: matchedUserEds
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
module.exports.applicantByEvent = async (req, res) => {
  const school = req.user;
  try {
  const eventsCaption = await Event.find({ author: school._id }, 'caption');
  const eventsTitle = await Event.find({ author: school._id }, 'title');
const allUsers = await User.find({});
const allEdsUser = await Education.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
const matchedUserEds = [];
allUsers.forEach(user => {
    const userAbout = user.about;
    eventsTitle.forEach(post => {
        const eventTitle = post.title;
        const score = fuzz.partial_ratio(eventTitle, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ eventTitle, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    eventsTitle.forEach(post => {
        const eventTitle = post.title;
        const scoreDegree = fuzz.partial_ratio(eventTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(eventTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(eventTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ eventTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});
allUsers.forEach(user => {
    const userAbout = user.about;
    eventsCaption.forEach(post => {
        const eventCaption = post.caption;
        const score = fuzz.partial_ratio(eventCaption, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ eventCaption, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    eventCaption.forEach(post => {
        const eventCaption = post.caption;
        const scoreDegree = fuzz.partial_ratio(eventCaption, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(eventCaption, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(eventCaption, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ eventCaption, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});
res.status(200).send({
      _STATUS: 'OK',
      _DATA: matchedUserEds
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
module.exports.applicantByJob = async (req, res) => {
  const school = req.user;
  try {
  const jobsTitle = await Job.find({ author: school._id }, 'title');
  const jobsReq = await Job.find({ author: school._id }, 'jobReq');
  const jobsType = await Job.find({ author: school._id }, 'typeofJob');
  const jobsCaption = await Job.find({ author: school._id }, 'caption');
const allUsers = await User.find({});
const allEdsUser = await Education.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
    const cvSkillJob = await Job.findOne({ author: school._id }, 'skillReq');
    const cvSkillJobs = await Job.findOne({ author: school._id }, 'skillReq');
    {/*a problem with skillReq.*/}
if (cvSkillJob) {
    const jobsSkillReq = cvSkillJob.skillReq;
    allEdsUser.forEach(user => {
        const userDegree = user.degree;
        const userSpecialization = user.specialization;
        const userSchoolOrUniv = user.schoolOrUniversity;
        const postTitle = jobsSkillReq;
        const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
} else {
    console.log("No matching job found for the school ID");
}

const allAccAwrdUser = await AccAwrd.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
if (cvSkillJobs.length > 0) {
    cvSkillJobs.forEach(cvSkillJob => {
        const jobsSkillReq = cvSkillJob.skillReq;
        allAccAwrdUser.forEach(user => {
            const usertitle = user.title;
            const userAssociatedWith = user.associatedWith;
            const userDesc = user.desc;
            if (Array.isArray(jobsSkillReq)) {
                jobsSkillReq.forEach(post => {
                    const postTitle = post.skillReq;
                    const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
                    const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
                    const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
                    if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
                        const isMatched = matchedUserEds.some(match => match.user._id === user._id);
                        if (!isMatched) {
                            matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
                        }
                    }
                });
            } else {
                console.log("jobsSkillReq is not an array");
            }
        });
    });
} else {
    console.log("No matching jobs found for the school ID");
}

const allAccCertUser = await AccCert.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
if (cvSkillJobs.length > 0) {
    cvSkillJobs.forEach(cvSkillJob => {
        const jobsSkillReq = cvSkillJob.skillReq;
        allAccCertUser.forEach(user => {
            const userCertName = user.CertName;
            if (Array.isArray(jobsSkillReq)) {
                jobsSkillReq.forEach(post => {
                    const postTitle = post.skillReq;
                    const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
                    if (scoreCertName >= 70) {
                        const isMatched = matchedUserEds.some(match => match.user._id === user._id);
                        if (!isMatched) {
                            matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
                        }
                    }
                });
            } else {
                console.log("jobsSkillReq is not an array");
            }
        });
    });
} else {
    console.log("No matching jobs found for the school ID");
}

const allAccOrgUser = await AccompOrg.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
if (cvSkillJobs.length > 0) {
    cvSkillJobs.forEach(cvSkillJob => {
        const jobsSkillReq = cvSkillJob.skillReq;
        allAccOrgUser.forEach(user => {
            const userPositionHeld = user.positionHeld;
            const userAssociatedCollegeEtc = user.associatedCollegeEtc;
            const userDescription = user.description;
            if (Array.isArray(jobsSkillReq)) {
                jobsSkillReq.forEach(post => {
                    const postTitle = post.skillReq;
                    const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
                    const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
                    const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
                    if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
                        const isMatched = matchedUserEds.some(match => match.user._id === user._id);
                        if (!isMatched) {
                            matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
                        }
                    }
                });
            } else {
                console.log("jobsSkillReq is not an array");
            }
        });
    });
} else {
    console.log("No matching jobs found for the school ID");
}

const allAccSkillUser = await Skill.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
if (cvSkillJobs.length > 0) {
    cvSkillJobs.forEach(cvSkillJob => {
        const jobsSkillReq = cvSkillJob.skillReq;
        allAccSkillUser.forEach(user => {
            const userSkill = user.skill;
            const userDescription = user.description;
            if (Array.isArray(jobsSkillReq)) {
                jobsSkillReq.forEach(post => {
                    const postTitle = post.skillReq;
                    const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
                    const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
                    if (scoreSkill >= 70 || scoreDescription >= 70) {
                        const isMatched = matchedUserEds.some(match => match.user._id === user._id);
                        if (!isMatched) {
                            matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
                        }
                    }
                });
            } else {
                console.log("jobsSkillReq is not an array");
            }
        });
    });
} else {
    console.log("No matching jobs found for the school ID");
}

const allAccPubUser = await AccPub.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversity location avatarPic about',
    });
if (cvSkillJobs.length > 0) {
    cvSkillJobs.forEach(cvSkillJob => {
        const jobsSkillReq = cvSkillJob.skillReq;
        allAccPubUser.forEach(user => {
            const userTitle = user.title;
            const userPublisher = user.publisher;
            const userDesc = user.desc;
            if (Array.isArray(jobsSkillReq)) {
                jobsSkillReq.forEach(post => {
                    const postTitle = post.skillReq;
                    const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
                    const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
                    const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
                    if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
                        const isMatched = matchedUserEds.some(match => match.user._id === user._id);
                        if (!isMatched) {
                            matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
                        }
                    }
                });
            } else {
                console.log("jobsSkillReq is not an array");
            }
        });
    });
} else {
    console.log("No matching jobs found for the school ID");
}

const matchedUserEds = [];
allUsers.forEach(user => {
    const userAbout = user.about;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const score = fuzz.partial_ratio(postTitle, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});

allAccAwrdUser.forEach(user => {
    const usertitle = user.title;
    const userAssociatedWith = user.associatedWith;
    const userDesc = user.desc;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
        const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
            }
        }
    });
});

allAccCertUser.forEach(user => {
    const userCertName = user.CertName;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
        if (scoreCertName >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
            }
        }
    });
});

allAccOrgUser.forEach(user => {
    const userPositionHeld = user.positionHeld;
    const userAssociatedCollegeEtc = user.associatedCollegeEtc;
    const userDescription = user.description;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
        const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
            }
        }
    });
});

allAccSkillUser.forEach(user => {
    const userSkill = user.skill;
    const userDescription = user.description;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scoreSkill >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
            }
        }
    });
});

allAccPubUser.forEach(user => {
    const userTitle = user.title;
    const userPublisher = user.publisher;
    const userDesc = user.desc;
    jobsTitle.forEach(post => {
        const postTitle = post.title;
        const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
        const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
            }
        }
    });
});

{/*repeat with different points*/}

allUsers.forEach(user => {
    const userAbout = user.about;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const score = fuzz.partial_ratio(postTitle, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});

allAccAwrdUser.forEach(user => {
    const usertitle = user.title;
    const userAssociatedWith = user.associatedWith;
    const userDesc = user.desc;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
        const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
            }
        }
    });
});

allAccCertUser.forEach(user => {
    const userCertName = user.CertName;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
        if (scoreCertName >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
            }
        }
    });
});

allAccOrgUser.forEach(user => {
    const userPositionHeld = user.positionHeld;
    const userAssociatedCollegeEtc = user.associatedCollegeEtc;
    const userDescription = user.description;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
        const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
            }
        }
    });
});

allAccSkillUser.forEach(user => {
    const userSkill = user.skill;
    const userDescription = user.description;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scoreSkill >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
            }
        }
    });
});

allAccPubUser.forEach(user => {
    const userTitle = user.title;
    const userPublisher = user.publisher;
    const userDesc = user.desc;
    jobsReq.forEach(post => {
        const postTitle = post.jobReq;
        const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
        const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
            }
        }
    });
});

{/*repeat with different points*/}

allUsers.forEach(user => {
    const userAbout = user.about;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const score = fuzz.partial_ratio(postTitle, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});

allAccAwrdUser.forEach(user => {
    const usertitle = user.title;
    const userAssociatedWith = user.associatedWith;
    const userDesc = user.desc;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
        const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
            }
        }
    });
});

allAccCertUser.forEach(user => {
    const userCertName = user.CertName;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
        if (scoreCertName >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
            }
        }
    });
});

allAccOrgUser.forEach(user => {
    const userPositionHeld = user.positionHeld;
    const userAssociatedCollegeEtc = user.associatedCollegeEtc;
    const userDescription = user.description;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
        const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
            }
        }
    });
});

allAccSkillUser.forEach(user => {
    const userSkill = user.skill;
    const userDescription = user.description;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scoreSkill >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
            }
        }
    });
});

allAccPubUser.forEach(user => {
    const userTitle = user.title;
    const userPublisher = user.publisher;
    const userDesc = user.desc;
    jobsType.forEach(post => {
        const postTitle = post.typeofJob;
        const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
        const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
            }
        }
    });
});

{/*repeat with different points*/}

allUsers.forEach(user => {
    const userAbout = user.about;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const score = fuzz.partial_ratio(postTitle, userAbout);
        if (score >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userAbout, score });
            }
        }
    });
});
allEdsUser.forEach(user => {
    const userDegree = user.degree;
    const userSpecialization = user.specialization;
    const userSchoolOrUniv = user.schoolOrUniversity;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
        const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
        const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
        if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
            }
        }
    });
});

allAccAwrdUser.forEach(user => {
    const usertitle = user.title;
    const userAssociatedWith = user.associatedWith;
    const userDesc = user.desc;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
        const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
            }
        }
    });
});

allAccCertUser.forEach(user => {
    const userCertName = user.CertName;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
        if (scoreCertName >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
            }
        }
    });
});

allAccOrgUser.forEach(user => {
    const userPositionHeld = user.positionHeld;
    const userAssociatedCollegeEtc = user.associatedCollegeEtc;
    const userDescription = user.description;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
        const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
            }
        }
    });
});

allAccSkillUser.forEach(user => {
    const userSkill = user.skill;
    const userDescription = user.description;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
        const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
        if (scoreSkill >= 70 || scoreDescription >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
            }
        }
    });
});

allAccPubUser.forEach(user => {
    const userTitle = user.title;
    const userPublisher = user.publisher;
    const userDesc = user.desc;
    jobsCaption.forEach(post => {
        const postTitle = post.caption;
        const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
        const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
        const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
        if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
            const isMatched = matchedUserEds.some(match => match.user._id === user._id);
            if (!isMatched) {
                matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
            }
        }
    });
});

{/*repeat with different points*/}

// allUsers.forEach(user => {
//     const userAbout = user.about;
//     jobsSkillReq.forEach(job => {
//         job.skillReq.forEach(skill => {
//             const score = fuzz.partial_ratio(skill, userAbout);
//             if (score >= 70) {
//                 const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//                 if (!isMatched) {
//                     matchedUserEds.push({ skill, user, userAbout, score });
//                 }
//             }
//         });
//     });
// });

// allEdsUser.forEach(user => {
//     const userDegree = user.degree;
//     const userSpecialization = user.specialization;
//     const userSchoolOrUniv = user.schoolOrUniversity;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scoreDegree = fuzz.partial_ratio(postTitle, userDegree);
//         const scoreSpecialization = fuzz.partial_ratio(postTitle, userSpecialization);
//         const scoreSchoolOrUniv = fuzz.partial_ratio(postTitle, userSchoolOrUniv);
//         if (scoreDegree >= 70 || scoreSpecialization >= 70 || scoreSchoolOrUniv >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, userDegree, userSpecialization, userSchoolOrUniv, scoreDegree, scoreSpecialization, scoreSchoolOrUniv });
//             }
//         }
//     });
// });

// allAccAwrdUser.forEach(user => {
//     const usertitle = user.title;
//     const userAssociatedWith = user.associatedWith;
//     const userDesc = user.desc;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scoreTitle = fuzz.partial_ratio(postTitle, usertitle);
//         const scoreAssociatedWith = fuzz.partial_ratio(postTitle, userAssociatedWith);
//         const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
//         if (scoreTitle >= 70 || scoreAssociatedWith >= 70 || scoreDesc >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, usertitle, userAssociatedWith, userDesc, scoreTitle, scoreAssociatedWith, scoreDesc });
//             }
//         }
//     });
// });

// allAccCertUser.forEach(user => {
//     const userCertName = user.CertName;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scoreCertName = fuzz.partial_ratio(postTitle, userCertName);
//         if (scoreCertName >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, userCertName,  scoreCertName });
//             }
//         }
//     });
// });

// allAccOrgUser.forEach(user => {
//     const userPositionHeld = user.positionHeld;
//     const userAssociatedCollegeEtc = user.associatedCollegeEtc;
//     const userDescription = user.description;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scorePositionHeld = fuzz.partial_ratio(postTitle, userPositionHeld);
//         const scoreAssociatedCollegeEtc = fuzz.partial_ratio(postTitle, userAssociatedCollegeEtc);
//         const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
//         if (scorePositionHeld >= 70 || scoreAssociatedCollegeEtc >= 70 || scoreDescription >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, userPositionHeld, userAssociatedCollegeEtc, userDescription, scorePositionHeld, scoreAssociatedCollegeEtc, scoreDescription });
//             }
//         }
//     });
// });

// allAccSkillUser.forEach(user => {
//     const userSkill = user.skill;
//     const userDescription = user.description;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scoreSkill = fuzz.partial_ratio(postTitle, userSkill);
//         const scoreDescription = fuzz.partial_ratio(postTitle, userDescription);
//         if (scoreSkill >= 70 || scoreDescription >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, userSkill, userDescription, scoreDescription, scoreSkill });
//             }
//         }
//     });
// });

// allAccPubUser.forEach(user => {
//     const userTitle = user.title;
//     const userPublisher = user.publisher;
//     const userDesc = user.desc;
//     jobsSkillReq.forEach(post => {
//         const postTitle = post.skillReq;
//         const scoreTitle = fuzz.partial_ratio(postTitle, userTitle);
//         const scorePublisher = fuzz.partial_ratio(postTitle, userPublisher);
//         const scoreDesc = fuzz.partial_ratio(postTitle, userDesc);
//         if (scoreTitle >= 70 || scorePublisher >= 70 || scoreDesc >= 70) {
//             const isMatched = matchedUserEds.some(match => match.user._id === user._id);
//             if (!isMatched) {
//                 matchedUserEds.push({ postTitle, user, userTitle, userPublisher, userDesc, scoreTitle, scorePublisher, scoreDesc });
//             }
//         }
//     });
// });

res.status(200).send({
      _STATUS: 'OK',
      _DATA: matchedUserEds
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}