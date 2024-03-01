const UserSkill = require('../../../models/userSkill.model')
const User = require('../../../models/user.model')
const AccCert = require('../../../models/accomp.cert.model')
const AccAwrd = require('../../../models/accomp.awrd.model')
const AccompOrg = require('../../../models/accomp.org.model')
const AccPub = require('../../../models/accomp.pub.model')
const AccProj = require('../../../models/accomp.proj.model')
module.exports.networkbyskills = async (req, res) => {
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
    const matchedUsers = await UserSkill.find({
      $or: [
        { skill: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    res.status(200).send({
      _skills: skills,
      _regex: regex,
      _data: matchedUsers
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({
      _status: 'bad',
      _err: err
    })
  }
}
module.exports.networkbyabout = async (req, res) => {
  const user = req.user;
  const userabt = user.about;
  try {
    const regex = new RegExp(userabt, 'i');
    const matchedUsers = await User.find({
    about: { $regex: regex }
    }).select('username fullname schoolOrUniversityName location avatarPic about');
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
}
// module.exports.matchuserbyAttach = async (req, res) => {
//   const user = req.user;
//   try {
//     const userCert = await AccCert.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           CertName: 1,
//           CertAuthority: 1,
//         }
//       }
//     ]);
//     const certPatterns = userCert.map(cert => `(${cert.CertName}|${cert.CertAuthority})`).join('|');
//     const regex = new RegExp(certPatterns, 'i');
//     const userAwrd = await AccAwrd.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           title: 1,
//           associatedWith: 1,
//         }
//       }
//     ]);
//     const certPatterns0 = userAwrd.map(obj => `(${obj.title}|${obj.associatedWith})`).join('|');
//     const regex0 = new RegExp(certPatterns0, 'i');
//     const userOrgs = await AccompOrg.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           orgName: 1,
//           positionHeld: 1,
//           associatedCollegeEtc: 1,
//           description: 1
//         }
//       }
//     ]);
//     const certPatterns1 = userOrgs.map(obj => `(${obj.orgName}|${obj.positionHeld}|${obj.associatedCollegeEtc}|${obj.description})`).join('|');
//     const regex1 = new RegExp(certPatterns1, 'i');
//     const userProj = await AccProj.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           projectName: 1,
//           desc: 1,
//         }
//       }
//     ]);
//     const certPatterns2 = userProj.map(obj => `(${obj.projectName}|${obj.desc})`).join('|');
//     const regex2 = new RegExp(certPatterns2, 'i');
//     const userPubs = await AccPub.aggregate([
//       {
//         $match: {
//           user: user._id
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           title: 1,
//           publisher: 1,
//           desc:1
//         }
//       }
//     ]);
//     const certPatterns3 = userPubs.map(obj => `(${obj.title}|${obj.publisher}|${obj.desc})`).join('|');
//     const regex3 = new RegExp(certPatterns3, 'i');
//     const matchedCert = await AccCert.find({
//       $or: [
//         { CertName: { $regex: regex } },
//         { CertAuthority: { $regex: regex } },
//       ]
//     }).populate({
//       path: 'user',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });
//     const matchedAwrd = await AccAwrd.find({
//       $or: [
//         { title: { $regex: regex0 } },
//         { associatedWith: { $regex: regex0 } },
//       ]
//     }).populate({
//       path: 'user',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });
//     const matchedOrgs = await AccompOrg.find({
//       $or: [
//         { orgName: { $regex: regex1 } },
//         { positionHeld: { $regex: regex1 } },
//                 { associatedCollegeEtc: { $regex: regex1 } },
//                         { description: { $regex: regex1 } },
//       ]
//     }).populate({
//       path: 'user',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });
//     const matchedProjs = await AccProj.find({
//       $or: [
//         { projectName: { $regex: regex2 } },
//         { desc: { $regex: regex2 } },
//       ]
//     }).populate({
//       path: 'user',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });
//     const matchedPubs = await AccPub.find({
//       $or: [
//         { title: { $regex: regex3 } },
//         { publisher: { $regex: regex3 } },
//         { desc: { $regex: regex3 } },
//       ]
//     }).populate({
//       path: 'user',
//       select: 'username fullname schoolOrUniversityName location avatarPic about',
//     });
//     res.status(200).send({
//       _status: 'SUCCESS',
//       _thiscred: {
//         cert: userCert,
//         awrd: userAwrd,
//         org: userOrgs,
//         proj: userProj,
//         pub: userPubs,
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
{/*fixing unrelated fields got other user received by null credentials*/}
module.exports.matchuserbyAttach = async (req, res) => {
  const user = req.user;
  try {
    const userCert = await AccCert.find({ user: user._id });
    const userAwrd = await AccAwrd.find({ user: user._id });
    const userOrgs = await AccompOrg.find({ user: user._id });
    const userProj = await AccProj.find({ user: user._id });
    const userPubs = await AccPub.find({ user: user._id });
    const certRegex = userCert.length > 0 ? userCert.map(cert => `(${cert.CertName}|${cert.CertAuthority})`).join('|') : null;
    const awrdRegex = userAwrd.length > 0 ? userAwrd.map(obj => `(${obj.title}|${obj.associatedWith})`).join('|') : null;
    const orgRegex = userOrgs.length > 0 ? userOrgs.map(obj => `(${obj.orgName}|${obj.positionHeld}|${obj.associatedCollegeEtc}|${obj.description})`).join('|') : null;
    const projRegex = userProj.length > 0 ? userProj.map(obj => `(${obj.projectName}|${obj.desc})`).join('|') : null;
    const pubRegex = userPubs.length > 0 ? userPubs.map(obj => `(${obj.title}|${obj.publisher}|${obj.desc})`).join('|') : null;
    const matchedCert = certRegex ? await AccCert.find({
      $or: [
        { CertName: { $regex: certRegex, $options: 'i' } },
        { CertAuthority: { $regex: certRegex, $options: 'i' } }
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    }) : null;
    const matchedAwrd = awrdRegex ? await AccAwrd.find({
      $or: [
        { title: { $regex: awrdRegex, $options: 'i' } },
        { associatedWith: { $regex: awrdRegex, $options: 'i' } }
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    }) : null;
    const matchedOrgs = orgRegex ? await AccompOrg.find({
      $or: [
        { orgName: { $regex: orgRegex, $options: 'i' } },
        { positionHeld: { $regex: orgRegex, $options: 'i' } },
        { associatedCollegeEtc: { $regex: orgRegex, $options: 'i' } },
        { description: { $regex: orgRegex, $options: 'i' } },
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    }) : null;
    const matchedProjs = projRegex ? await AccProj.find({
      $or: [
        { projectName: { $regex: projRegex, $options: 'i' } },
        { desc: { $regex: projRegex, $options: 'i' } },
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    }) : null;
    const matchedPubs = pubRegex ? await AccPub.find({
      $or: [
        { title: { $regex: pubRegex, $options: 'i' } },
        { publisher: { $regex: pubRegex, $options: 'i' } },
        { desc: { $regex: pubRegex, $options: 'i' } },
      ]
    }).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    }) : null;
    res.status(200).send({
      _status: 'SUCCESS',
      _thiscred: {
        cert: userCert.length > 0 ? userCert : null,
        awrd: userAwrd.length > 0 ? userAwrd : null,
        org: userOrgs.length > 0 ? userOrgs : null,
        proj: userProj.length > 0 ? userProj : null,
        pub: userPubs.length > 0 ? userPubs : null,
      },
      _fromcert: matchedCert,
      _fromawrd: matchedAwrd,
      _fromorg: matchedOrgs,
      _fromproj: matchedProjs,
      _frompub: matchedPubs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
module.exports.getAllbycred = async (req, res) => {
  const { sortbylimit } = req.params;
  try {
    const allCerts = await AccCert.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const allAwrds = await AccAwrd.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const allOrgs = await AccompOrg.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const allProj = await AccProj.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const allPubs = await AccPub.find({}).populate({
      path: 'user',
      select: 'username fullname schoolOrUniversityName location avatarPic about',
    });
    const allAccs = [...allCerts, ...allAwrds, ...allOrgs, ...allProj, ...allPubs];
    const shuffledAccs = allAccs.sort(() => Math.random() - 0.5); 
    const limitedResults = shuffledAccs.slice(0, parseInt(sortbylimit));
    res.status(200).send({
      _status: 'SUCCESS',
      _results: limitedResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      _STATUS: 'BAD',
      _ERR: err
    });
  }
}
