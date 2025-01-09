import { parseMarkdown } from "@/lib/markdown";
import { readFile } from "node:fs/promises";

export interface AboutProps {
  about: {
    title: string;
    text: string;
  };
}

export const loader = async (): Promise<AboutProps> => {
  const contents = await readFile("./src/assets/about.md", "utf-8");
  const markdown = parseMarkdown(contents);
  return {
    about: {
      title: markdown.title,
      text: markdown.text,
    },
  };
};
