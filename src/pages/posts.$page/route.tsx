import { RouteRecord } from "vite-react-ssg";
import { loader } from "./loader";
import { PostHistory } from "./PostHistory";

export const route: RouteRecord = {
  path: "posts/:page",
  element: <PostHistory />,
  loader,
};
