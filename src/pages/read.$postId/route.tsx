import { RouteRecord } from "vite-react-ssg";
import { loader } from "./loader";
import { ReadPost } from "./ReadPost";

export const route: RouteRecord = {
  path: "read/:postId",
  element: <ReadPost />,
  loader,
};
