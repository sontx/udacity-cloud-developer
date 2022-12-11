import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import {PostItem} from "../models/PostItem";
import {UpdatePostRequest} from "../requests/UpdatePostRequest";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('PostsAccess');

export class PostsAccess {
  constructor(
    private readonly docClient: DocumentClient = new (
      XAWS.DynamoDB as any
    ).DocumentClient(),
    private readonly postsTable = process.env.POSTS_TABLE
  ) {}

  async getAllPosts(userId: string): Promise<PostItem[]> {
    logger.info('Get all posts', { userId });
    const result = await this.docClient
      .query({
        TableName: this.postsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise();

    return result.Items as PostItem[];
  }

  async createPost(post: PostItem): Promise<PostItem> {
    await this.docClient
      .put({
        TableName: this.postsTable,
        Item: post
      })
      .promise();

    return post;
  }

  async updatePost(postId: string, userId: string, post: UpdatePostRequest) {
    await this.docClient
      .update({
        TableName: this.postsTable,
        Key: {
          postId: postId,
          userId: userId
        },
        UpdateExpression:
          'set #title = :title, #content = :content',
        ExpressionAttributeValues: {
          ':title': post.title,
          ':content': post.content,
        },
        ExpressionAttributeNames: {
          "#title": "title",
          "#content": "content"
        }
      })
      .promise();
  }

  async updatePostAttachment(
    postId: string,
    userId: string,
    attachmentUrl: string
  ) {
    await this.docClient
      .update({
        TableName: this.postsTable,
        Key: {
          postId: postId,
          userId: userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise();
  }

  async postExists(userId: string, postId: string) {
    return !!this.getPost(userId, postId);
  }

  async getPost(userId: string, postId: string) {
    const result = await this.docClient
      .query({
        TableName: this.postsTable,
        KeyConditionExpression: 'postId = :postId AND userId = :userId',
        ExpressionAttributeValues: {
          ':postId': postId,
          ':userId': userId
        }
      })
      .promise();

    return result.Count > 0 ? result.Items[0] : null;
  }

  async deletePost(postId: string, userId: string) {
    await this.docClient
      .delete({
        TableName: this.postsTable,
        Key: {
          postId: postId,
          userId: userId
        }
      })
      .promise();
  }
}
