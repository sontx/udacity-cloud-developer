import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import { deletePost } from '../../businessLogic/posts';

const logger = createLogger('deletePost');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const userId = getUserId(event);

    await deletePost(userId, postId);

    logger.info(`Deleted post`, { userId, postId: postId });

    return {
      statusCode: 200,
      body: null
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
