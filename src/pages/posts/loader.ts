import { getAllPosts } from "@/lib/markdown";

export interface PostPreview {
  id: string;
  title: string;
  date: number;
  preview: string;
  tags?: string[];
}

export interface PostHistoryProps {
  posts: PostPreview[];
}

const PREVIEW_SIZE = 100;
export const loader = async (): Promise<PostHistoryProps> => {
  const posts = await getAllPosts();
  return {
    posts: posts.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date.getTime(),
      preview: item.text.slice(0, PREVIEW_SIZE),
      tags: item.tags,
    })),
  };
};
