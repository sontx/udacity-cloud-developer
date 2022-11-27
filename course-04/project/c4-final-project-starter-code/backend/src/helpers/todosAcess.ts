import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new (
      XAWS.DynamoDB as any
    ).DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Get all todos', { userId });
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise();

    return result.Items as TodoItem[];
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise();

    return todo;
  }

  async updateTodo(todoId: string, userId: string, todo: UpdateTodoRequest) {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          ':todoId': todoId,
          ':userId': userId
        },
        UpdateExpression:
          'set name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        }
      })
      .promise();
  }

  async updateTodoAttachment(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ) {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          ':todoId': todoId,
          ':userId': userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise();
  }

  async todoExists(userId: string, todoId: string) {
    return !!this.getTodo(userId, todoId);
  }

  async getTodo(userId: string, todoId: string) {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId AND userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId
        }
      })
      .promise();

    return result.Count > 0 ? result.Items[0] : null;
  }

  async deleteTodo(todoId: string, userId: string) {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          ':todoId': todoId,
          ':userId': userId
        }
      })
      .promise();
  }
}
