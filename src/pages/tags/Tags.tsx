import { useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";
import { TagList } from "@/components/tags/TagList";
import { Head } from "vite-react-ssg";

export const Tags = () => {
  const tags = useLoaderData() as LoaderType<typeof loader>;
  return (
    <>
      <Head>
        <title>Tags</title>
      </Head>
      <div className="px-6">
        <TagList tags={tags} />
      </div>
    </>
  );
};
