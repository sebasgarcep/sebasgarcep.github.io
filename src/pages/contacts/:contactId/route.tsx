import { RouteObject } from "react-router-dom";
import ContactRoute from "./ContactRoute";
import { loader } from "./loader"

export const route: RouteObject = {
  path: "contacts/:contactId",
  element: <ContactRoute />,
  loader
};
