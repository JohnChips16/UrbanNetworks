const { exec } = require('child_process');
const axios = require('axios');
const linkedIn = require('linkedin-jobs-api');

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
  try {
    const {
      keyword,
      location,
      dateSincePosted,
      jobType,
      remoteFilter,
      salary,
      experienceLevel,
      limit
    } = req.body;
    const queryOptions = {
      keyword: keyword,
      location: location,
      dateSincePosted: dateSincePosted,
      jobType: jobType,
      remoteFilter: remoteFilter,
      salary: salary,
      experienceLevel: experienceLevel,
      limit: limit
    };
    const response = await linkedIn.query(queryOptions);
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('A problem occurred while fetching from the server.');
  }
};


module.exports.fetchLinkedInLocReccomendation = async (req, res) => {
  const user = req.user;
  const user_loc = user.location;
  try {
    const queryOptions = {
      location: user_loc,
      dateSincePosted: "past Week",
      remoteFilter: "remote",
      limit: "10",
    };
    console.log(user)
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
