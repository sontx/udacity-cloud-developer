import { beforeEach, expect, jest, test } from '@jest/globals';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { PostsAccess } from './postsAccess';

let postAccess: PostsAccess;

beforeEach(() => {
  AWSMock.restore();
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
    const userId = (params.ExpressionAttributeValues as any)[':userId'];
    const postId = (params.ExpressionAttributeValues as any)[':postId'];

    const data = [
      {
        userId: '123',
        postId: '456',
        title: 'title',
        content: 'content'
      },
      {
        userId: '321',
        postId: '654',
        title: 'title 1',
        content: 'content 1'
      }
    ];

    const matchItems = data.filter(
      (item) => item.userId === userId && (!postId || item.postId === postId)
    );

    callback(null, {
      Count: matchItems.length,
      Items: matchItems
    } as any);
  });
  AWSMock.mock('DynamoDB.DocumentClient', 'put', function (params, callback) {
    callback(null, params.Item);
  });

  postAccess = new PostsAccess();
});

test('can get all posts', async () => {
  const posts = await postAccess.getAllPosts('123');
  expect(posts).toHaveLength(1);
  expect(posts[0].userId).toEqual('123');
});

test('can create', async () => {
  const createdAt = new Date().toISOString();
  const post = await postAccess.createPost({
    userId: '123',
    postId: '456',
    title: 'title',
    content: 'content',
    createdAt
  });
  expect(post.userId).toEqual('123');
  expect(post.postId).toEqual('456');
  expect(post.title).toEqual('title');
  expect(post.content).toEqual('content');
  expect(post.createdAt).toEqual(createdAt);
});

test('can update', async () => {
  const updateMock = jest.fn();
  AWSMock.mock(
    'DynamoDB.DocumentClient',
    'update',
    function (params, callback) {
      updateMock(params.Key);
      callback(null, params.Item);
    }
  );
  await postAccess.updatePost('456', '123', {
    title: 'new title',
    content: 'new content'
  });
  expect(updateMock).toBeCalled();
  expect(updateMock).toBeCalledWith({ postId: '456', userId: '123' });
});

test('can post attachment', async () => {
  const updateMock = jest.fn();
  AWSMock.mock(
    'DynamoDB.DocumentClient',
    'update',
    function (params, callback) {
      updateMock(params.Key, params.ExpressionAttributeValues);
      callback(null, params.Item);
    }
  );
  await postAccess.updatePostAttachment('456', '123', 'my-url');
  expect(updateMock).toBeCalled();
  expect(updateMock).toBeCalledWith(
    { postId: '456', userId: '123' },
    { ':attachmentUrl': 'my-url' }
  );
});

test('can get post by postId and userId', async () => {
  const post = await postAccess.getPost('123', '456');
  expect(post).toBeDefined();
  expect(post.userId).toEqual('123');
  expect(post.postId).toEqual('456');
});

test('can delete post by postId and userId', async () => {
  const deleteMock = jest.fn();
  AWSMock.mock(
    'DynamoDB.DocumentClient',
    'delete',
    function (params, callback) {
      deleteMock(params.Key);
      callback(null, params.Item);
    }
  );

  await postAccess.deletePost('123', '456');
  expect(deleteMock).toBeCalled();
  expect(deleteMock).toBeCalledWith({ postId: '123', userId: '456' });
});
