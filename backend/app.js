require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
const port = 8080;

// Configure AWS Rekognition with environment variables
AWS.config.update({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION // Ensure this is set in your .env file
});
const rekognition = new AWS.Rekognition();

app.use(express.json());

// Middleware to parse incoming requests with JSON payloads
// Increase the payload limit to a size that can handle your image data
app.use(bodyParser.json({ limit: '50mb' })); // Increase payload limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Endpoint to receive frames from the frontend
app.post('/process_image', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Remove the data URL prefix to get just the base64 encoded bytes
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Log the buffer size
        console.log('Buffer size:', buffer.length);

        // Ensure the buffer is not empty and within size limits for AWS Rekognition
        if (buffer.length === 0) {
            return res.status(400).json({ error: 'Invalid image data' });
        }
        if (buffer.length > 5242880) { // AWS Rekognition limit is 5MB
            return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
        }

        // Parameters for AWS Rekognition
        const params = {
            Image: {
                Bytes: buffer
            },
            MaxLabels: 10
        };

        // Call AWS Rekognition to detect labels (objects) in the image
        const data = await rekognition.detectLabels(params).promise();

        // Process the response to extract the necessary information
        const detectedLabels = data.Labels.map(label => ({
            Name: label.Name,
            Confidence: label.Confidence,
            Instances: label.Instances.map(instance => ({
                BoundingBox: instance.BoundingBox
            }))
        }));

        console.log('Detected labels:' ,detectedLabels);

        // Send the detected objects back to the frontend
        res.json({ labels: detectedLabels });

    } catch (error) {
        console.error('Error detecting objects:', error);
        res.status(500).json({ error: 'Error detecting objects' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
