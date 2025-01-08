import { FC } from "react";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => (
  <div className="text-white mt-2">{text}</div>
);
