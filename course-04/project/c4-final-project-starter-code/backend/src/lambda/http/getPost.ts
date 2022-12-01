import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import { getPost } from '../../helpers/posts';

const logger = createLogger('getPost');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const userId = getUserId(event);

    const post = await getPost(userId, postId);

    logger.info(`Get a post`, { userId, postId: postId });

    return {
      statusCode: 200,
      body: JSON.stringify(post)
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
