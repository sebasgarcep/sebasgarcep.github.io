import { LoaderType } from "@/lib/types";
import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";

// FIXME: INCLUDE FURTHER READING or NEXT/PREVIOUS POST
export const ReadPost = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div>
      <h1>{data.title}</h1>
      <h2>{new Date(data.date).toISOString()}</h2>
      <h3>{data.timeToRead} min</h3>
      <span>{data.text}</span>
      {data.tags ? (
        <ul>
          {data.tags.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
