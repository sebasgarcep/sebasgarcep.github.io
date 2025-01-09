import { useLoaderData } from "react-router-dom";

import { LoaderType } from "@/lib/types";

import { type loader } from "./loader";
import { PostList } from "@/components/posts/PostList";
import { Head } from "vite-react-ssg";

export const TagPosts = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <>
      <Head>
        <title>{data.tag}</title>
      </Head>
      <PostList posts={data.posts} />
    </>
  );
};
