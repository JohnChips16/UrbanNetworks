const { exec } = require('child_process');
const axios = require('axios');
const linkedIn = require('linkedin-jobs-api');
const User = require('../../models/user.model')
const UserSkill = require('../../models/userSkill.model')
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
const cheerio = require('cheerio')
async function fetchLinkedInJobs() {
  const url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
  const keywords = 'accounting';
  const location = 'Jatinangor';
  const start = 0;

  try {
    const response = await axios.get(url, {
      params: {
        keywords: keywords,
        location: location,
        start: start
      }
    });

    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Extract the job postings or other relevant information from the HTML
    const jobPostings = $('div.result-card__contents').map((i, el) => {
      return {
        title: $(el).find('h3').text(),
        company: $(el).find('.result-card__subtitle').text(),
        location: $(el).find('.job-result-card__location').text(),
        datePosted: $(el).find('.job-result-card__listdate').text()
      };
    }).get();

    return jobPostings;
  } catch (error) {
    throw new Error('Failed to fetch LinkedIn jobs: ' + error.message);
  }
}

module.exports.searchInstitute = async (req, res) => {
  const { search_university, search_limit } = req.params;
  const apiUrl = 'http://127.0.0.1:5000/search';
  try {
    const response = await axios.get(apiUrl, {
      params: {
        name: search_university,
        offset: 1,
        limit: search_limit || 1000,
      },
    });

    const pythonScriptPath = '/data/data/com.termux/files/home/Archieve/src/routes/services/scrap_univ.py';
    const pythonProcess = exec(`python ${pythonScriptPath} ${search_university} 1 ${search_limit || 1000}`);
    let pythonResponse = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonResponse += data;
    });
    pythonProcess.stderr.on('data', (error) => {
      console.error(`Error from Python script: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(pythonResponse);
          res.json({ originalResponse: response.data, pythonResponse: result });
        } catch (err) {
          console.error(`Error parsing Python response: ${err}`);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        console.error(`Python process closed with code ${code}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports.fetchLinkedIn = async (req, res) => {
  const user = req.user;
  try {
    const {
      q: keyword,
      l: location,
      dtp: dateSincePosted,
      jtp: jobType,
      rmtf: remoteFilter,
      slry: salary,
      exprl: experienceLevel,
      limit
    } = req.query;

    const parsedLimit = limit ? parseInt(limit, 10) : 25;

    // if (!keyword) {
    //   return res.status(400).send({
    //     _status: 'bad',
    //     _error: 'keyword cannot be undefined'
    //   });
    // }

    const queryOptions = {
      keyword: keyword || "",
      location: location || user.location || "",
      dateSincePosted: dateSincePosted || "",
      jobType: jobType || "",
      remoteFilter: remoteFilter || "",
      salary: salary || "",
      experienceLevel: experienceLevel || "",
      limit: parsedLimit
    };

    const response = await linkedIn.query(queryOptions);
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('A problem occurred while fetching from the server.');
  }
};
module.exports.fetchLinkedInSkillsPointed = async (req, res) => {
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
    const locations = [user.location, ""];
    const queryOptions = {
      keyword: randomSkill,
      location: getRandomElement(locations),
      dateSincePosted: "",
      jobType: "",
      remoteFilter: "",
      salary: "",
      experienceLevel: "",
      limit: 25
    };
    {/*example native url: https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=accounting&location=Jatinangor&start=0
    
    might change with axios.
    */}
  //   const url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
  // const start = 0;
  //   const response = await axios.get(url, {
  //     params: {
  //       keywords: randomSkill,
  //       location: getRandomElement(locations),
  //       start: start
  //     }
  //   });
   // res.status(200).send(response.data);
   // Example usage:
// fetchLinkedInJobs()
//   .then(jobPostings => {
//     console.log(jobPostings); // Logging the extracted job postings
//   })
//   .catch(error => {
//     console.error(error); // Logging any errors that occur during the request
//   });

    const response = await linkedIn.query(queryOptions);
    res.status(200).send(response)
  } catch (err) {
    console.log(err)
    res.status(500).send({
      _status: 'BAD',
      _error: err
    })
  }
}
module.exports.fetchLinkedInLocReccomendation = async (req, res) => {
  const user = req.user;
  const user_loc = user.location;
  try {
    const queryOptions = {
      keyword: "",
      location: user_loc,
      dateSincePosted: "",
      jobType: "",
      remoteFilter: "",
      salary: "",
      experienceLevel: "",
      limit: 25
    };
    const response = await linkedIn.query(queryOptions);
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('A problem occurred while fetching from the server.');
  }
};
module.exports.fetchArbeitBoard = async (req, res) => {
  try {
    const response = await axios.get('https://arbeitnow.com/api/job-board-api');
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('A problem occurred.');
  }
};
module.exports.fetchNewsLocationCategories = async (req, res) => {
  const { categories } = req.params;
  const user = req.user;
  const location = user.location;
  try {
    const url = `http://127.0.0.1:5000/news/category?location=${location}&category=${categories}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      why: 'internal server error.',
      debug: err,
    });
  }
};
module.exports.fetchNewsLocation = async (req, res) => {
  const user = req.user;
  try {
    if (!user || !user.location) {
      return res.status(400).json({
        error: 'User location not available.',
      });
    }
    const url = `http://127.0.0.1:5000/news?location=${user.location}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      why: 'internal server error.',
      debug: err,
    });
  }
};
