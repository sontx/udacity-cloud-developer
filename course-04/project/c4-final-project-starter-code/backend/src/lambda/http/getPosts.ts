import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import {getAllPosts} from "../../helpers/posts";

const logger = createLogger('getPosts');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const posts = await getAllPosts(userId);

    logger.info(`Get all posts`, { userId, count: posts.length });

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: posts
      })
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
