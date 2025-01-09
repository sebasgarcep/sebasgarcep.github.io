import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";
import { TagList } from "@/components/tags/TagList";

export const Tags = () => {
  const tags = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="px-6">
      <TagList tags={tags} />
    </div>
  );
};
