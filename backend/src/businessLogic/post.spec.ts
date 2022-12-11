import { beforeEach, expect, jest, test } from '@jest/globals';
import { PostsAccess } from '../dataLayer/postsAccess';
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getUploadUrl,
  updatePost
} from './posts';

const getAllPostsMock = jest
  .spyOn(PostsAccess.prototype, 'getAllPosts')
  .mockImplementation(async () => []);
const createPostMock = jest
  .spyOn(PostsAccess.prototype, 'createPost')
  .mockImplementation(async () => null);
const updatePostMock = jest
  .spyOn(PostsAccess.prototype, 'updatePost')
  .mockImplementation(async () => null);
const updatePostAttachmentMock = jest
  .spyOn(PostsAccess.prototype, 'updatePostAttachment')
  .mockImplementation(async () => null);
const postExistsMock = jest
  .spyOn(PostsAccess.prototype, 'postExists')
  .mockImplementation(async () => true);
const getPostMock = jest
  .spyOn(PostsAccess.prototype, 'getPost')
  .mockImplementation(async () => {
    return {};
  });
const deletePostMock = jest
  .spyOn(PostsAccess.prototype, 'deletePost')
  .mockImplementation(async () => null);
const getUploadUrlMock = jest
  .spyOn(AttachmentUtils.prototype, 'getUploadUrl')
  .mockImplementation(() => '');

beforeEach(() => {
  jest.clearAllMocks();
});

test('can get all posts', async () => {
  await getAllPosts('123');
  expect(getAllPostsMock).toBeCalled();
  expect(getAllPostsMock).toBeCalledWith('123');
});

test('can create a post', async () => {
  await createPost('123', {
    title: 'title',
    content: 'content'
  });
  expect(createPostMock).toBeCalled();
});

test('can update a post', async () => {
  await updatePost('123', '456', {
    title: 'title',
    content: 'content'
  });
  expect(postExistsMock).toBeCalled();
  expect(updatePostMock).toBeCalled();
});

test('can get a post', async () => {
  await getPost('123', '456');
  expect(getPostMock).toBeCalled();
});

test('can delete a post', async () => {
  await deletePost('123', '456');
  expect(deletePostMock).toBeCalled();
});

test('can get upload url for a post', async () => {
  await getUploadUrl('123', '456', '111');
  expect(getUploadUrlMock).toBeCalled();
  expect(updatePostAttachmentMock).toBeCalled();
});
