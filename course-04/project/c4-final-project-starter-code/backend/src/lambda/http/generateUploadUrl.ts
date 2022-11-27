import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import * as uuid from 'uuid';
import { getUserId } from '../utils';
import { getUploadUrl } from '../../helpers/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    const imageId = uuid.v4();
    const url = await getUploadUrl(userId, todoId, imageId);

    logger.info(`Generated upload url`, { userId, todoId, url });

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
