const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const { Deepgram } = require('@deepgram/sdk');

const app = express();
const port = 3000;

// Load environment variables
dotenv.config();

// Create an S3 instance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create a deepgram instance
const deepgram = new Deepgram({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

// Configure multer-s3 for file uploads to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'hngscreenrecord',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'videos/' + Date.now() + '-' + file.originalname);
    },
  }),
});

// Endpoint
app.use(express.json());

app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Get the S3 object URL
    const fileUrl = file.location;

    // Transcribe the video using Deepgram
    const response = await deepgram.transcription.preRecorded(
      { url: "https://http://16.171.165.62:3000/upload-video" + filename },
      { punctuate: true, utterances: true }
    );

    const srtTranscript = response.toSRT();

    res.status(200).json({
      status: 'Success',
      transcript: srtTranscript,
    });
  } catch (error) {
    console.error('Upload and transcription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

