import { TodosAccess } from './todosAcess';
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as uuid from 'uuid';
import * as createError from 'http-errors';

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export async function getAllTodos(userId: string) {
  return todosAccess.getAllTodos(userId);
}

export async function createTodo(userId: string, todo: CreateTodoRequest) {
  const newTodo: TodoItem = {
    ...todo,
    todoId: uuid.v4(),
    userId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: ''
  };

  return await todosAccess.createTodo(newTodo);
}

export async function updateTodo(
  userId: string,
  todoId: string,
  todo: UpdateTodoRequest
) {
  if (!(await todosAccess.todoExists(userId, todoId))) {
    throw createError(404, 'Todo does not exist');
  }

  await todosAccess.updateTodo(todoId, userId, todo);
}

export async function deleteTodo(userId: string, todoId: string) {
  if (!(await todosAccess.todoExists(userId, todoId))) {
    throw createError(404, 'Todo does not exist');
  }

  await todosAccess.deleteTodo(todoId, userId);
}

export async function getUploadUrl(
  userId: string,
  todoId: string,
  imageId: string
) {
  if (!(await todosAccess.todoExists(userId, todoId))) {
    throw createError(404, 'Todo does not exist');
  }

  const uploadUrl = attachmentUtils.getUploadUrl(imageId);

  const downloadUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;
  await todosAccess.updateTodoAttachment(todoId, userId, downloadUrl);

  return uploadUrl;
}
