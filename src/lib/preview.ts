import { Markdown } from "./markdown";

export interface PostPreview {
  id: string;
  title: string;
  date: number;
  preview: string;
  tags?: string[];
}

const PREVIEW_SIZE = 100;
export const getPostPreview = (item: Markdown): PostPreview => ({
  id: item.id,
  title: item.title,
  date: item.date.getTime(),
  preview: item.text.slice(0, PREVIEW_SIZE),
  tags: item.tags,
});
