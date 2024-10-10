import { RouteRecord } from "vite-react-ssg";
import { ContactInfo } from "./ContactInfo";
import { loader } from "./loader";

export const route: RouteRecord = {
  path: "contacts/:contactId",
  element: <ContactInfo />,
  loader,
};
