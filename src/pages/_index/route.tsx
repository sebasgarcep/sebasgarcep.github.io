import { RouteRecord } from "vite-react-ssg";
import { Index } from "./Layout";

import { route as aboutRoute } from "../about/route";
import { route as postsRoute } from "../posts/route";
import { route as readRoute } from "../read.$postId/route";
import { route as tagsRoute } from "../tags/route";
import { route as tagInfoRoute } from "../tags.$tag/route";
import { ErrorPage } from "../_error";

export const route: RouteRecord = {
  path: "/",
  element: <Index />,
  errorElement: <ErrorPage />,
  children: [aboutRoute, postsRoute, readRoute, tagsRoute, tagInfoRoute],
};
