import { RouteRecord } from "vite-react-ssg";
import { loader } from "./loader";
import { Tags } from "./Tags";

export const route: RouteRecord = {
  path: "tags",
  element: <Tags />,
  loader,
};
