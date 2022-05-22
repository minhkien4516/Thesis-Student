export interface PostsFilter {
  id?: string;
  title?: string;
  content?: string;
  authorId?: string;
  isPublished?: string;
  isActive: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface PostsFilterResponse {
  data: PostsFilter[];
  pagination?;
}
