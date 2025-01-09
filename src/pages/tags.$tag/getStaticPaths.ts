import { RouteRecord } from "vite-react-ssg";
import { getAllTags } from "@/lib/tags";

export const getStaticPaths: NonNullable<
  RouteRecord["getStaticPaths"]
> = async () => {
  const tags = await getAllTags();
  return tags.map((item) => `/tags/${encodeURIComponent(item)}`);
};
