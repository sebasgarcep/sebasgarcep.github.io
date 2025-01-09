import { getAllPosts } from "@/lib/markdown";
import { getPostPreview, PostPreview } from "@/lib/preview";

export interface PostHistoryProps {
  posts: PostPreview[];
}

export const loader = async (): Promise<PostHistoryProps> => {
  const posts = await getAllPosts();
  return {
    posts: posts.map(getPostPreview),
  };
};
