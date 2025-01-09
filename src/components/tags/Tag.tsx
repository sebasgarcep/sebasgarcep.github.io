import { FC } from "react";
import { Link } from "react-router-dom";

export interface TagProps {
  title: string;
}

export const Tag: FC<TagProps> = ({ title }) => (
  <div className="text-gray-300 border bg-muted/10 px-4 py-2 rounded-2xl hover:bg-muted/50 transition-all whitespace-nowrap">
    <Link to={`/tags/${encodeURIComponent(title)}`}>{title}</Link>
  </div>
);
