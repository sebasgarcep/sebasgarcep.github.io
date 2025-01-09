import { Markdown } from "./markdown";

export interface PostPreview {
  id: string;
  title: string;
  subtitle: string;
  date: number;
  tags?: string[];
}

export const getPostPreview = (item: Markdown): PostPreview => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  date: item.date.getTime(),
  tags: item.tags,
});
