import { parse } from "yaml";
import * as zod from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface Markdown {
  id: string;
  title: string;
  date: Date;
  tags?: string[];
  image?: {
    src: string;
    alt: string;
  };
  text: string;
}

const metadataSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  date: zod.string(),
  tags: zod.array(zod.string()).optional(),
  image: zod
    .object({
      src: zod.string(),
      alt: zod.string(),
    })
    .optional(),
});

export const parseMarkdown = (contents: string): Markdown => {
  contents = contents.trim();

  if (!contents.startsWith("---")) {
    throw new Error("Markdown should include metadata");
  }

  const metadataText = contents.split("---", 2).at(1);
  if (!metadataText) {
    throw new Error("No metadata found on markdown.");
  }

  const metadata = metadataSchema.parse(parse(metadataText));

  const beginPosition = contents.indexOf("---", 3);

  return {
    ...metadata,
    date: new Date(metadata.date),
    text: contents.slice(beginPosition + 3).trim(),
  };
};

const getAllPostFilepaths = async (): Promise<string[]> => {
  const basePath = path.resolve("./src/assets/posts");
  const filenames = await fs.readdir(basePath);
  return filenames.map((item) => path.join(basePath, item));
};

export const getAllPosts = async (): Promise<Markdown[]> => {
  const filepaths = await getAllPostFilepaths();
  const fileContents = await Promise.all(
    filepaths.map((filepath) => fs.readFile(filepath, "utf-8")),
  );
  return fileContents
    .map((item) => parseMarkdown(item))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};
