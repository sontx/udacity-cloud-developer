import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import { CreatePostRequest } from '../../requests/CreatePostRequest';
import { createPost } from '../../businessLogic/posts';

const logger = createLogger('createPost');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newPost: CreatePostRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const post = await createPost(userId, newPost);

    logger.info(`Created post`, { userId, post: post });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: post
      })
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
