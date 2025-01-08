import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";
import { Tag } from "@/components/Tag";

export const Tags = () => {
  const tags = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="flex flex-row items-start gap-2">
      {tags.map((item) => (
        <Tag key={item} title={item} />
      ))}
    </div>
  );
};
