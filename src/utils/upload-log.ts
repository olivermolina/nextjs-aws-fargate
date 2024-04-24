import { FileInput } from './zod-schemas/file-upload';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from '../libs/aws-s3';

export const uploadLogo = async (file: FileInput, organizationId: string) => {
  try {
    const buffer = Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64');

    const extension = file.name.split('.').pop();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${organizationId}/logo.${extension}`,
      Body: buffer,
      ContentType: file.type,
    };
    const result = await new Upload({
      client: s3Client,
      params,
    }).done();
    return result.Key || '';
  } catch (error) {
    console.error(error);

    return '';
  }
};
