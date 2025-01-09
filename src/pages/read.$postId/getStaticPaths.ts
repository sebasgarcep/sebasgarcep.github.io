import { getAllPosts } from "@/lib/markdown";
import { RouteRecord } from "vite-react-ssg";

export const getStaticPaths: NonNullable<
  RouteRecord["getStaticPaths"]
> = async () => {
  const posts = await getAllPosts();
  return posts.map((item) => `/read/${item.id}`);
};
