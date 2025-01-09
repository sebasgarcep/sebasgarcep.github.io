import { FC } from "react";
import "highlight.js/styles/vs2015.min.css";
import "katex/dist/katex.min.css";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => {
  return (
    <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: text }} />
  );
};
