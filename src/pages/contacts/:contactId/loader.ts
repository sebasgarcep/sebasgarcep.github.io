import { LoaderFunctionArgs } from "react-router-dom"

export const loader = ({ params }: LoaderFunctionArgs) => {
  const contact = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: params.contactId!,
    first: "Your",
    last: "Name",
    avatar: "https://robohash.org/you.png?size=200x200",
    twitter: "your_handle",
    notes: "Some notes",
    favorite: true,
  };
  return { contact };
}