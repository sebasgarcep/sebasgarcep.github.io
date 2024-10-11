import { getAllPosts } from "@/lib/markdown";

export const loader = async (): Promise<string[]> => {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    if (!post.tags) {
      continue;
    }
    for (const tag of post.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
};
