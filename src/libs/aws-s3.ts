import { S3Client } from '@aws-sdk/client-s3';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_S3_REGION || 'ca-central-1';
if (!accessKeyId || !secretAccessKey) {
  throw Error('Invalid AWS API Keys.');
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default s3Client;
