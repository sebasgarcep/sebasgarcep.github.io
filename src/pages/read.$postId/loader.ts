import { LoaderFunctionArgs } from "react-router-dom";

import { getAllPosts } from "@/lib/markdown";

export interface ReadPostProps {
  post: {
    id: string;
    title: string;
    date: number;
    text: string;
    tags?: string[];
  };
  previousPost: {
    id: string;
    title: string;
  } | null;
  nextPost: {
    id: string;
    title: string;
  } | null;
}

export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<ReadPostProps> => {
  const posts = await getAllPosts();
  const postIndex = posts.findIndex((item) => item.id === params.postId);
  if (postIndex === -1) {
    throw new Error(`No post found with ID: ${params.postId ?? ""}`);
  }

  const post = posts[postIndex];
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null;
  const previousPost =
    postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  return {
    post: {
      id: post.id,
      title: post.title,
      date: post.date.getTime(),
      text: post.text,
      tags: post.tags,
    },
    previousPost: previousPost && {
      id: previousPost.id,
      title: previousPost.title,
    },
    nextPost: nextPost && {
      id: nextPost.id,
      title: nextPost.title,
    },
  };
};
