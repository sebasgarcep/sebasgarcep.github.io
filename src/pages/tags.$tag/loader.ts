import { getAllPosts } from "@/lib/markdown";
import { LoaderFunctionArgs } from "react-router-dom";
import { getPostPreview, PostPreview } from "@/lib/preview";

export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<{ posts: PostPreview[] }> => {
  const { tag: uriTag } = params;
  if (!uriTag) {
    throw new Error("No tag provided");
  }

  const tag = decodeURIComponent(uriTag);
  const posts = await getAllPosts();
  return {
    posts: posts.filter((item) => item.tags?.includes(tag)).map(getPostPreview),
  };
};
