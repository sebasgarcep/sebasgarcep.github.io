import { getAllPosts } from "@/lib/markdown";
import { LoaderFunctionArgs } from "react-router-dom";

export interface PostPreview {
  id: string;
  title: string;
  date: number;
  timeToRead: number;
  preview: string;
}

export interface PostHistoryProps {
  currentPage: number;
  numPages: number;
  posts: PostPreview[];
}

const PAGE_SIZE = 10;
const PREVIEW_SIZE = 250;
const WORDS_PER_MINUTE = 240;
export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<PostHistoryProps> => {
  const currentPage = Number(params.page);
  if (Number.isNaN(currentPage)) {
    throw new Error("Page is not a number");
  }

  const posts = await getAllPosts();
  return {
    currentPage,
    numPages: Math.ceil(posts.length / PAGE_SIZE),
    posts: posts
      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      .map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date.getTime(),
        preview: item.text.slice(0, PREVIEW_SIZE),
        timeToRead: Math.ceil(item.text.split(" ").length / WORDS_PER_MINUTE),
      })),
  };
};
