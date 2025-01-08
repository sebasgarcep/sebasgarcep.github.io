import { FC } from "react";

import { Tag } from "./Tag";

export interface TagListProps {
  tags: string[];
}

export const TagList: FC<TagListProps> = ({ tags }) => {
  return (
    <div className="flex flex-row items-start gap-2 w-full flex-wrap">
      {tags.map((item) => (
        <Tag key={item} title={item} />
      ))}
    </div>
  );
};
