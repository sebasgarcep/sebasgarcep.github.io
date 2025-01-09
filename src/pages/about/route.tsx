import { RouteRecord } from "vite-react-ssg";
import { About } from "./About";
import { loader } from "./loader";

export const route: RouteRecord = {
  path: "about",
  element: <About />,
  loader,
};
