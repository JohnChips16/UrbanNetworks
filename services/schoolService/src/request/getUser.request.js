const axios = require('axios');

const url = 'http://localhost:3000/v1/users/suggested/2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWFlMGJjYWZiNzM3ZDQ2NDM2NTA4YzAiLCJpYXQiOjE3MDYxNTg5MTUsImV4cCI6MTcwNjE2MDcxNSwidHlwZSI6ImFjY2VzcyJ9.k_GWcSNJByIjl2gHHLwPYMWPaEM9jQh8hnUMAoaLljs';

axios.get(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
  .then(response => {
    // Assuming the result is in the 'data' property of the response
    const result = response.data;

    // Check if there is a result and construct the JSON response
    const jsonResponse = result ? { result } : { error: 'No result available' };

    console.log(jsonResponse);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
