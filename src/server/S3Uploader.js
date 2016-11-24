const crypto = require('crypto');
const fs = require('fs');

const AWS = require('aws-sdk');

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: Bucket,
  S3_BUCKET_PATH,
} = process.env;

module.exports = class S3Uploader {
  constructor() {
    AWS.config = new AWS.Config({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      region: 'us-west-2',
    });
    this.s3 = new AWS.S3();
    this.directory = [
      S3_BUCKET_PATH,
      crypto.randomBytes(16).toString('hex'),
    ].filter(Boolean).join('/');
  }

  /**
   * Creates a bucket (or gets it if already exists).
   *
   * @return {Promise}
   */
  prepare() {
    return new Promise((resolve, reject) => {
      this.s3.headBucket({ Bucket }, (headErr) => {
        if (headErr) {
          this.s3.createBucket({ Bucket }, (createErr) => {
            if (createErr) {
              reject(createErr);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Uploads a file stream or a string.
   *
   * @param {string} body
   * @param {string} pathToFile
   * @param {string} contentType
   * @param {string} fileName
   *
   * @return {Promise}
   */
  upload({ body, pathToFile, contentType, contentEncoding, fileName }) {
    return new Promise((resolve, reject) => {
      if (!body) {
        body = fs.createReadStream(pathToFile); // eslint-disable-line no-param-reassign
      }
      const uploadParams = {
        Body: body,
        Bucket,
        ContentType: contentType,
        ContentEncoding: contentEncoding,
        Key: `${this.directory}/${fileName}`,
      };

      this.s3.upload(uploadParams, (err, { Location }) => {
        if (err) {
          reject(err);
        } else {
          resolve(Location);
        }
      });
    });
  }
};
