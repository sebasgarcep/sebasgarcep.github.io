import { Link } from "react-router-dom";

import { TagList } from "@/components/tags/TagList";
import { PostPreview } from "@/lib/preview";

import { PostDate } from "./PostDate";
import { PostTitle } from "./PostTitle";
import { FC } from "react";

export interface PostListProps {
  posts: PostPreview[];
}

export const PostList: FC<PostListProps> = ({ posts }) => {
  return (
    <div className="flex flex-col px-6 pb-4 gap-8">
      {posts.map((item) => (
        <div key={item.id} className="hover:scale-105 transition-all">
          <Link to={`/read/${item.id}`}>
            <PostTitle title={item.title} />
            <PostDate date={new Date(item.date)} />
            <div className="text-gray-300 mt-2">{item.subtitle}</div>
            <div className="mt-4">
              {item.tags && <TagList tags={item.tags} />}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};
