import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import * as uuid from 'uuid';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import {getUploadUrl} from "../../helpers/posts";

const logger = createLogger('generateUploadUrl');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const userId = getUserId(event);

    const imageId = uuid.v4();
    const url = await getUploadUrl(userId, postId, imageId);

    logger.info(`Generated upload url`, { userId, postId: postId, url });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
