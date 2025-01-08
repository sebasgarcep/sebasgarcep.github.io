import { LoaderType } from "@/lib/types";
import { Link, useLoaderData } from "react-router-dom";
import { format } from "date-fns";
import { type loader } from "./loader";

export const PostHistory = () => {
  const data = useLoaderData() as LoaderType<typeof loader>;
  return (
    <div className="flex flex-col px-4 gap-8">
      {data.posts.map((item) => (
        <Link
          to={`/read/${item.id}`}
          key={item.id}
          className="hover:scale-105 transition-all"
        >
          <div
            className="text-2xl font-bold"
            style={{ color: "lab(80.574 30.6 -11.24)" }}
          >
            {item.title}
          </div>
          <h2 className="text-gray-300 text-xs">
            {format(new Date(item.date), "LLLL d, yyyy")}
          </h2>
          <span className="text-white">{item.preview}...</span>
        </Link>
      ))}
    </div>
  );
};
