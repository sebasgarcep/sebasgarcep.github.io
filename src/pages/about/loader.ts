import * as fs from "node:fs/promises";
import { parseMarkdown } from "@/lib/markdown";

export interface AboutProps {
  about: {
    title: string;
    text: string;
  };
}

export const loader = async (): Promise<AboutProps> => {
  const contents = await fs.readFile("./src/assets/about.md", "utf-8");
  const markdown = parseMarkdown(contents);
  return {
    about: {
      title: markdown.title,
      text: markdown.text,
    },
  };
};
