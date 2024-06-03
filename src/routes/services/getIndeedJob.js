const indeed = require('indeed-scraper');
const User = require('../../models/user.model')
const UserSkill = require('../../models/userSkill.model')
{/*paid for expanding limits?*/}
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
module.exports.getIndeedjobs = async (req, res) => {
    const user = req.user;
    const { queryParam, locationParam, jobtypeParam, levelParam, limitParam } = req.query;

    const location = locationParam || user.location;
    const limit = limitParam || 25;

    try {
        const queryOptions = {
            host: 'www.indeed.com',
            query: '',
            city: user.location || '',
            radius: '',
            level: '',
            jobType: '',
            maxAge: '',
            sort: 'date',
            limit: 25
        };
        
        const result = await indeed.query(queryOptions);
        console.log(result); // An array of Job objects
        res.status(200).send({
            _from: 'Indeed',
            _response: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            _status: 'bad',
            _error: err.message
        });
    }
};
module.exports.getIndeedJobsBySkillSingle = async (req, res) => {
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
    const shuffledSkills = shuffleArray(skills);
    const randomSkill = shuffledSkills.length > 0 ? shuffledSkills[Math.floor(Math.random() * shuffledSkills.length)] : '';
    const levels = ['entry_level', 'mid_level', 'senior_level', ''];
    const locations = [user.location, ''];
    const jobTypes = ['fulltime', 'contract', 'parttime', 'temporary', 'internship', 'commission', ''];
    const queryOptions = {
      host: 'www.indeed.com',
      query: randomSkill,
      city: getRandomElement(locations),
      radius: '',
      level: getRandomElement(levels),
      jobType: getRandomElement(jobTypes), 
      maxAge: '',
      sort: 'date',
      limit: 25 
    };
    indeed.query(queryOptions).then(result => {
      res.status(200).send({
        _from: 'Indeed',
        _algol: 'bySkill_shuffled',
        _response: result,
        _query: queryOptions
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _status: 'BAD',
      _error: err
    });
  }
};
module.exports.getIndeedJobsBySkillRoulette = async (req, res) => {
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
    const levels = ['entry_level', 'mid_level', 'senior_level', ''];
    const locations = [user.location, ''];
    const jobTypes = ['fulltime', 'contract', 'parttime', 'temporary', 'internship', 'commission', ''];
    let foundResponse = false;
    let queryOptions = {};
    for (let skill of skills) {
      for (let location of locations) {
        for (let level of levels) {
          for (let jobType of jobTypes) {
            queryOptions = {
              host: 'www.indeed.com',
              query: skill,
              city: location,
              radius: '',
              level: level,
              jobType: jobType,
              maxAge: '',
              sort: 'date',
              limit: 25
            };
            console.log('Querying with:', queryOptions);
            const result = await indeed.query(queryOptions);
            if (result && result.length > 0) {
              foundResponse = true;
              res.status(200).send({
                _from: 'Indeed',
                _algol: 'bySkill_shuffled',
                _response: result,
                _query: queryOptions
              });
              break; 
            }
          }
          if (foundResponse) break; 
        }
        if (foundResponse) break; 
      }
      if (foundResponse) break; 
    }
    if (!foundResponse) {
      res.status(404).send({
        _status: 'NOT_FOUND',
        _error: 'No jobs found for the given criteria'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _status: 'BAD',
      _error: err
    });
  }
};
module.exports.getIndeedJobsByQueryRoulette = async (req, res) => {
  const user = req.user;
  const queryParam = req.params;
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
    const levels = ['entry_level', 'mid_level', 'senior_level', ''];
    const locations = [user.location, ''];
    const jobTypes = ['fulltime', 'contract', 'parttime', 'temporary', 'internship', 'commission', ''];
    let foundResponse = false;
    let queryOptions = {};
    for (let skill of skills) {
      for (let location of locations) {
        for (let level of levels) {
          for (let jobType of jobTypes) {
            queryOptions = {
              host: 'www.indeed.com',
              query: queryParam,
              city: location,
              radius: '',
              level: level,
              jobType: jobType,
              maxAge: '',
              sort: 'date',
              limit: 25
            };
            console.log('Querying with:', queryOptions);
            const result = await indeed.query(queryOptions);
            if (result && result.length > 0) {
              foundResponse = true;
              res.status(200).send({
                _from: 'Indeed',
                _algol: 'byQuery_shuffled',
                _response: result,
                _query: queryOptions
              });
              break; 
            }
          }
          if (foundResponse) break; 
        }
        if (foundResponse) break; 
      }
      if (foundResponse) break; 
    }
    if (!foundResponse) {
      res.status(404).send({
        _status: 'NOT_FOUND',
        _error: 'No jobs found for the given criteria'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _status: 'BAD',
      _error: err
    });
  }
};

module.exports.getIndeedJobsByQueryDefaultRoulette = async (req, res) => {
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
    const levels = ['entry_level', 'mid_level', 'senior_level', ''];
    const locations = [user.location, ''];
    const jobTypes = ['fulltime', 'contract', 'parttime', 'temporary', 'internship', 'commission', ''];
    let foundResponse = false;
    let queryOptions = {};
    for (let skill of skills) {
      for (let location of locations) {
        for (let level of levels) {
          for (let jobType of jobTypes) {
            queryOptions = {
              host: 'www.indeed.com',
              query: '',
              city: location,
              radius: '',
              level: level,
              jobType: jobType,
              maxAge: '',
              sort: 'date',
              limit: 25
            };
            console.log('Querying with:', queryOptions);
            const result = await indeed.query(queryOptions);
            if (result && result.length > 0) {
              foundResponse = true;
              res.status(200).send({
                _from: 'Indeed',
                _algol: 'byQueryDefault_shuffled',
                _response: result,
                _query: queryOptions
              });
              break; 
            }
          }
          if (foundResponse) break; 
        }
        if (foundResponse) break; 
      }
      if (foundResponse) break; 
    }
    if (!foundResponse) {
      res.status(404).send({
        _status: 'NOT_FOUND',
        _error: 'No jobs found for the given criteria'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      _status: 'BAD',
      _error: err
    });
  }
};


