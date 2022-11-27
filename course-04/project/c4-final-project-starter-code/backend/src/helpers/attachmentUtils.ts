import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({
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
      Expires: this.urlExpiration
    });
  }
}
