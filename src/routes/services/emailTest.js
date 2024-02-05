const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

const credentials = require('./client_secret.json');
const redirectUri = (credentials.web && credentials.web.redirect_uris && credentials.web.redirect_uris[0]) || 'urn:ietf:wg:oauth:2.0:oob';

// Create an OAuth2 client
const oAuth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  redirectUri
);

// Rest of the code remains the same

// Load or refresh the token
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) return getNewToken(oAuth2Client);
  oAuth2Client.setCredentials(JSON.parse(token));
  listLabels(oAuth2Client); // Replace with the function you want to execute
});

// Function to get a new token
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}

// Function to send an email
function sendEmail(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = 'To: example@gmail.com\n' +
              'Subject: Test email\n\n' +
              'This is a test email from Gmail API.';

  const encodedMessage = Buffer.from(raw).toString('base64');

  gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: encodedMessage,
    },
  }, (err, res) => {
    if (err) return console.error('Error sending email:', err);
    console.log('Email sent:', res.data);
  });
}

// Function to list labels (an example, replace with your desired functionality)
function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.error('The API returned an error:', err.message);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(label.name);
      });
    } else {
      console.log('No labels found.');
    }
  });
}
