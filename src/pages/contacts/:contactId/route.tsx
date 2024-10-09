import { RouteObject } from "react-router-dom";
import { ContactInfo } from "./ContactInfo";
import { loader } from "./loader";

export const route: RouteObject = {
  path: "contacts/:contactId",
  element: <ContactInfo />,
  loader,
};
