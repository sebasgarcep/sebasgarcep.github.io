import { useLoaderData } from "react-router-dom";

import { LoaderType } from "@/lib/types";

import { type loader } from "./loader";
import { PostList } from "@/components/posts/PostList";

export const TagPosts = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return <PostList posts={data.posts} />;
};
