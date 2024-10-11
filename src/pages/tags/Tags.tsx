import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";

export const Tags = () => {
  const tags = useLoaderData() as LoaderType<typeof loader>;
  return (
    <ul>
      {tags.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};
