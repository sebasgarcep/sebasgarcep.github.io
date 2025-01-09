import { parse } from "yaml";
import * as zod from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import markdownit from "markdown-it";
import katex from "katex";
import hljs from "highlight.js";

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

function renderLatex(text: string) {
  // Qllowing newlines inside of `$$...$$`
  text = text.replace(/\$\$([^$]+?)\$\$/g, (_match, expression: string) => {
    try {
      return katex.renderToString(expression, {
        displayMode: true,
        output: "html",
      });
    } catch (error) {
      console.log(expression);
      throw error;
    }
  });

  // Not allowing newlines or space inside of `$...$`
  text = text.replace(/\$([^$]+?)\$/g, (_match, expression: string) => {
    try {
      return katex.renderToString(expression, {
        displayMode: false,
        output: "html",
      });
    } catch (error) {
      console.log(expression);
      throw error;
    }
  });

  return text;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const md = markdownit({
  html: true,
  highlight: function (str, lang) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (__) {
        /* empty */
      }
    }

    return "";
  },
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

  const rawText = contents.slice(beginPosition + 3).trim();
  const withoutLatex = renderLatex(rawText);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const text = md.render(withoutLatex);

  return {
    ...metadata,
    date: new Date(metadata.date),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    text,
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
