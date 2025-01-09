import { LoaderType } from "@/lib/types";
import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { PostTitle } from "@/components/posts/PostTitle";
import { PostDate } from "@/components/posts/PostDate";
import { PostBody } from "@/components/posts/PostBody";
import { TagList } from "@/components/tags/TagList";

export const ReadPost = () => {
  const { post } = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="px-4">
      <PostTitle title={post.title} />
      <PostDate date={new Date(post.date)} />
      <PostBody text={post.text} />
      <div className="my-8">
        {post.tags ? <TagList tags={post.tags} /> : null}
      </div>
    </div>
  );
};
