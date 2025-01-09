import { Link, useLoaderData } from "react-router-dom";

import { LoaderType } from "@/lib/types";
import { PostBody } from "@/components/posts/PostBody";
import { PostDate } from "@/components/posts/PostDate";
import { PostTitle } from "@/components/posts/PostTitle";

import { type loader } from "./loader";
import { TagList } from "@/components/tags/TagList";

export const PostHistory = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="flex flex-col px-4 gap-8">
      {data.posts.map((item) => (
        <Link
          to={`/read/${item.id}`}
          key={item.id}
          className="hover:scale-105 transition-all"
        >
          <PostTitle title={item.title} />
          <PostDate date={new Date(item.date)} />
          <PostBody text={`${item.preview}...`} />
          <div className="mt-4">
            {item.tags && <TagList tags={item.tags} />}
          </div>
        </Link>
      ))}
    </div>
  );
};
