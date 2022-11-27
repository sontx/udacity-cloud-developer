import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { deleteTodo } from '../../helpers/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    await deleteTodo(userId, todoId);

    logger.info(`Deleted todo`, { userId, todoId });

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
