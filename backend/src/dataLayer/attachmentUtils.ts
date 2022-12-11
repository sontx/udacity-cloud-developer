import * as AWS from 'aws-sdk';
import { createLogger } from '../utils/logger';

const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  constructor(
    private readonly s3 = new AWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getUploadUrl(imageId: string) {
    logger.info(`Create upload url`, { imageId: imageId });
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: parseInt(this.urlExpiration)
    });
  }
}
