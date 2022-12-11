import { AttachmentUtils } from './attachmentUtils';
import * as uuid from 'uuid';
import * as createError from 'http-errors';
import { PostItem } from '../models/PostItem';
import { CreatePostRequest } from '../requests/CreatePostRequest';
import { PostsAccess } from './postsAccess';
import { UpdatePostRequest } from '../requests/UpdatePostRequest';

const postsAccess = new PostsAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export async function getAllPosts(userId: string) {
  return postsAccess.getAllPosts(userId);
}

export async function createPost(userId: string, post: CreatePostRequest) {
  const newPost: PostItem = {
    ...post,
    postId: uuid.v4(),
    userId,
    createdAt: new Date().toISOString(),
    attachmentUrl: ''
  };

  return await postsAccess.createPost(newPost);
}

export async function updatePost(
  userId: string,
  postId: string,
  post: UpdatePostRequest
) {
  if (!(await postsAccess.postExists(userId, postId))) {
    throw new createError.NotFound('Post does not exist');
  }

  await postsAccess.updatePost(postId, userId, post);
}

export async function getPost(userId: string, postId: string) {
  const post = await postsAccess.getPost(userId, postId);
  if (!post) {
    throw new createError.NotFound('Post does not exist');
  }
  return post;
}

export async function deletePost(userId: string, postId: string) {
  if (!(await postsAccess.postExists(userId, postId))) {
    throw new createError.NotFound('Post does not exist');
  }

  await postsAccess.deletePost(postId, userId);
}

export async function getUploadUrl(
  userId: string,
  postId: string,
  imageId: string
) {
  if (!(await postsAccess.postExists(userId, postId))) {
    throw new createError.NotFound('Post does not exist');
  }

  const uploadUrl = attachmentUtils.getUploadUrl(imageId);

  const downloadUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;
  await postsAccess.updatePostAttachment(postId, userId, downloadUrl);

  return uploadUrl;
}
