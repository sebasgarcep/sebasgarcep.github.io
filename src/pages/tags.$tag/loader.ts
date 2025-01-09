import { getAllPosts } from "@/lib/markdown";
import { LoaderFunctionArgs } from "react-router-dom";
import { PostPreview } from "../posts/loader";

const PREVIEW_SIZE = 100;
export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<{ posts: PostPreview[] }> => {
  const { tag: uriTag } = params;
  if (!uriTag) {
    throw new Error("No tag provided");
  }

  const tag = decodeURIComponent(uriTag);
  console.log(tag);
  const posts = await getAllPosts();
  return {
    posts: posts
      .filter((item) => item.tags?.includes(tag))
      .map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date.getTime(),
        preview: item.text.slice(0, PREVIEW_SIZE),
        tags: item.tags,
      })),
  };
};
