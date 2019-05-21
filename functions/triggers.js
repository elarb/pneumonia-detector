const admin = require('firebase-admin');

const sizeOf = require('image-size');
const fs = require('fs');
const os = require('os');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const mkdirp = require('mkdirp-promise');

// GCP libraries
const {Storage} = require('@google-cloud/storage');
const storage = new Storage;
const automl = require('@google-cloud/automl');
const predictionClient = new automl.PredictionServiceClient();

// Constants
const PROJECT = 'pupilflow-240709';
const REGION = 'us-central1';

// Models
const AUTOML_MODELS = {
  "pneumonia": 'ICN8092400454685006474'
};

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 200;
const THUMB_MAX_WIDTH = 200;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

admin.initializeApp();
const db = admin.firestore();

function callAutoMLAPI(b64img, model) {
  return new Promise((resolve, reject) => {
    const payload = {
      "image": {
        "imageBytes": b64img
      }
    };
    const reqBody = {
      name: predictionClient.modelPath(PROJECT, REGION, AUTOML_MODELS[model]),
      payload: payload
    };
    predictionClient.predict(reqBody)
      .then(responses => {
        console.log('Got a prediction from AutoML API!', JSON.stringify(responses));
        resolve(responses);
      })
      .catch(err => {
        console.log('AutoML API Error: ', err);
        reject(err);
      });
  });

}

exports.callCustomModel = async object => {
  const timestamp = +new Date();

  const filePath = object.name;
  const contentType = object.contentType; // This is the image MIME type
  const fileBucket = object.bucket;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    return console.log('This is not an image.');
  }

  // Exit if its not an upload
  if (!filePath.startsWith('user/uploads/')) {
    return console.log('Not an uploaded item');
  }

  // Make sure we aren't making a thumbnail for a thumbnail (infinite loop)
  if (fileName.startsWith(THUMB_PREFIX)) {
    return console.log('Already a Thumbnail.');
  }

  // Get metadata
  let [, , userId, model, predId, ,] = filePath.split(path.sep);

  const bucket = storage.bucket(fileBucket);
  const file = bucket.file(filePath);
  const thumbFile = bucket.file(thumbFilePath);
  const metadata = {
    contentType: contentType,
    // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
    'Cache-Control': 'public,max-age=3600',
  };

  await mkdirp(tempLocalDir);
  await file.download({destination: tempLocalFile});
  console.log('The image has been downloaded to', tempLocalFile);

  // Resize
  if (sizeOf(tempLocalFile).width > 600) {
    console.log('scaling image down...');
    await spawn('convert', [tempLocalFile, '-resize', '600x', tempLocalFile]);
  }

  let bitmap = fs.readFileSync(tempLocalFile);
  let data = new Buffer(bitmap).toString('base64');
  let response = await callAutoMLAPI(data, model);

  let pred = {
    // Get only the first prediction response
    result: response[0]['payload'],
    predId,
    userId,
    model,
    fileName,
    timestamp
  };

  // Generate a thumbnail using ImageMagick.
  await spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], {capture: ['stdout', 'stderr']});
  console.log('Thumbnail created at', tempLocalThumbFile);
  // Uploading the Thumbnail.
  await bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata: metadata});
  console.log('Thumbnail uploaded to Storage at', thumbFilePath);
  // Once the image has been uploaded delete the local files to free up disk space.
  fs.unlinkSync(tempLocalFile);
  fs.unlinkSync(tempLocalThumbFile);

  try {
    // Get the Signed URLs for the thumbnail and original image.
    const config = {
      action: 'read',
      expires: '08-11-2500',
    };
    const results = await Promise.all([
      thumbFile.getSignedUrl(config),
      file.getSignedUrl(config),
    ]);
    console.log('Got Signed URLs.');
    const thumbResult = results[0];
    const originalResult = results[1];
    pred.thumbUrl = thumbResult[0];
    pred.imageUrl = originalResult[0];
  } catch (e) {
    console.log(e);
  }

  if (Object.keys(pred.result).length === 0) {
    pred.result = {"predictionErr": "No high confidence predictions found"};
  }

  // Add result to Database
  await db.collection('predictions').doc(predId).set(pred);

  return console.log('Prediction result saved to database.');
};

