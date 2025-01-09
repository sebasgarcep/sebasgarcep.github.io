import { Link } from "react-router-dom";

import { TagList } from "@/components/tags/TagList";
import { PostPreview } from "@/lib/preview";

import { PostBody } from "./PostBody";
import { PostDate } from "./PostDate";
import { PostTitle } from "./PostTitle";
import { FC } from "react";

export interface PostListProps {
  posts: PostPreview[];
}

export const PostList: FC<PostListProps> = ({ posts }) => {
  return (
    <div className="flex flex-col px-4 py-4 gap-8">
      {posts.map((item) => (
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
