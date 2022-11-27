import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';
import { updateTodo } from '../../helpers/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);

    await updateTodo(userId, todoId, updatedTodo);

    logger.info(`Updated todo`, { userId, todoId, updatedTodo });

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
