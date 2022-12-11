export interface Post {
  userId: string;
  postId: string;
  createdAt: string;
  title: string;
  content: string;
  attachmentUrl?: string;
}
