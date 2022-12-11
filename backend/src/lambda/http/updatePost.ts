import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import {UpdatePostRequest} from "../../requests/UpdatePostRequest";
import {updatePost} from "../../helpers/posts";

const logger = createLogger('updatePost');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const updatedPost: UpdatePostRequest = JSON.parse(event.body);
    const userId = getUserId(event);

    logger.info(`Updating post`, { userId, postId: postId, updatedPost: updatedPost });

    await updatePost(userId, postId, updatedPost);

    logger.info(`Updated post`, { userId, postId: postId, updatedPost: updatedPost });

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
