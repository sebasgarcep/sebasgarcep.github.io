import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";
import { TagList } from "@/components/tags/TagList";

export const Tags = () => {
  const tags = useLoaderData() as LoaderType<typeof loader>;
  return <TagList tags={tags} />;
};
