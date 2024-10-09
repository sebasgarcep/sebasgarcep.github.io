import { RouteObject } from "react-router-dom";
import { Layout } from "./Layout";

import { route as contactIdRoute } from "../contacts/:contactId/route"
import { ErrorPage } from "../_error";

export const route: RouteObject = {
  path: "/",
  element: <Layout />,
  errorElement: <ErrorPage />,
  children: [
    contactIdRoute
  ]
};