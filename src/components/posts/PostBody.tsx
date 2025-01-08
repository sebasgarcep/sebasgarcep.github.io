import { FC } from "react";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => (
  <span className="text-white">{text}</span>
);
