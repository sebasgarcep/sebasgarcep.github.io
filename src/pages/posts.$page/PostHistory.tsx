import { LoaderType } from "@/lib/types";
import { Link, useLoaderData } from "react-router-dom";
import { type loader } from "./loader";

export const PostHistory = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div>
      {data.posts.map((item) => (
        <div key={item.id}>
          <Link to={`/read/${item.id}`}>{item.title}</Link>
          <h2>{new Date(item.date).toISOString()}</h2>
          <h3>{item.timeToRead} min</h3>
          <span>{item.preview}</span>
        </div>
      ))}
    </div>
  );
};
