import { FC } from "react";
import "highlight.js/styles/vs2015.min.css";
import "katex/dist/katex.min.css";
import "./PostBody.css";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => {
  return (
    <div
      className="PostBody text-gray-300 mt-2"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};
