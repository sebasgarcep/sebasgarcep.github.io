import { RouteRecord } from "vite-react-ssg";

import { loader } from "./loader";
import { TagPosts } from "./TagPosts";

export const route: RouteRecord = {
  path: "tags/:tag",
  element: <TagPosts />,
  loader,
};
