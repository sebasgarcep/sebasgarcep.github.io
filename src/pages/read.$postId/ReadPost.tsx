import { LoaderType } from "@/lib/types";
import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { PostTitle } from "@/components/posts/PostTitle";
import { PostDate } from "@/components/posts/PostDate";
import { PostBody } from "@/components/posts/PostBody";
import { TagList } from "@/components/tags/TagList";

// FIXME: INCLUDE FURTHER READING or NEXT/PREVIOUS POST
export const ReadPost = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="px-4">
      <PostTitle title={data.title} />
      <PostDate date={new Date(data.date)} />
      <PostBody text={data.text} />
      <div className="my-8">
        {data.tags ? <TagList tags={data.tags} /> : null}
      </div>
    </div>
  );
};
