import { RouteObject } from "react-router-dom";
import { Layout } from "./Layout";

import { route as contactIdRoute } from "../contacts.$contactId/route";
import { route as aboutRoute } from "../about/route";
import { route as postsRoute } from "../posts.$page/route";
import { route as readRoute } from "../read.$postId/route";
import { route as tagsRoute } from "../tags/route";
import { route as tagInfoRoute } from "../tags.$tag/route";
import { ErrorPage } from "../_error";

export const route: RouteObject = {
  path: "/",
  element: <Layout />,
  errorElement: <ErrorPage />,
  children: [
    contactIdRoute,
    aboutRoute,
    postsRoute,
    readRoute,
    tagsRoute,
    tagInfoRoute,
  ],
};
