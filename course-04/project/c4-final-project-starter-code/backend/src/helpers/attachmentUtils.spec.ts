import { expect, jest, test } from '@jest/globals';
import AWS from 'aws-sdk';
import { AttachmentUtils } from './attachmentUtils';

jest.mock('aws-sdk', () => {
  const mockedS3 = {
    getSignedUrl: jest.fn(() => 'my-url')
  };
  return { S3: jest.fn(() => mockedS3) };
});

test('can get upload url', async () => {
  const attachmentUtils = new AttachmentUtils();
  const mockedS3 = new AWS.S3();

  const url = attachmentUtils.getUploadUrl('123');
  expect(mockedS3.getSignedUrl).toBeCalled();
  expect(url).toEqual('my-url');
});
