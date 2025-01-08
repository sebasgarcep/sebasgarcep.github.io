import { format } from "date-fns";
import { FC } from "react";

export interface PostDateProps {
  date: Date;
}

export const PostDate: FC<PostDateProps> = ({ date }) => (
  <h2 className="text-gray-300 text-xs">
    {format(new Date(date), "LLLL d, yyyy")}
  </h2>
);
