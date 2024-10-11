import { LoaderFunctionArgs } from "react-router-dom";

import { getAllPosts } from "@/lib/markdown";

export interface ReadPostProps {
  title: string;
  date: number;
  timeToRead: number;
  text: string;
  tags?: string[];
}

// FIXME: DEDUP THIS
const WORDS_PER_MINUTE = 240;
export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<ReadPostProps> => {
  const posts = await getAllPosts();
  const post = posts.find((item) => item.id === params.postId);
  if (!post) {
    throw new Error(`No post found with ID: ${params.postId ?? ""}`);
  }
  return {
    title: post.title,
    date: post.date.getTime(),
    timeToRead: Math.ceil(post.text.split(" ").length / WORDS_PER_MINUTE),
    text: post.text,
    tags: post.tags,
  };
};
