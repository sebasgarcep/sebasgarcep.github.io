import { FC } from "react";

export interface PostTitleProps {
  title: string;
}

export const PostTitle: FC<PostTitleProps> = ({ title }) => (
  <div
    className="text-2xl font-bold"
    style={{ color: "lab(80.574 30.6 -11.24)" }}
  >
    {title}
  </div>
);
