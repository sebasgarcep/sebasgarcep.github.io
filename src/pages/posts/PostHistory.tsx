import { useLoaderData } from "react-router-dom";

import { LoaderType } from "@/lib/types";

import { type loader } from "./loader";
import { PostList } from "@/components/posts/PostList";
import { Head } from "vite-react-ssg";

export const PostHistory = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <PostList posts={data.posts} />
    </>
  );
};
