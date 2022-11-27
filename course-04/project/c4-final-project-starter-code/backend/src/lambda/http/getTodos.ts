import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { getUserId } from '../utils';
import { getAllTodos } from '../../helpers/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todos = await getAllTodos(userId);

    logger.info(`Get all todos`, { userId, count: todos.length });

    return {
      statusCode: 200,
      body: JSON.stringify(todos)
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
