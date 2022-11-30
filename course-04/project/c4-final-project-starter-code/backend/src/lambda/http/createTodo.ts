import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const todo = await createTodo(userId, newTodo);

    logger.info(`Created todo`, { userId, todo });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo
      })
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
