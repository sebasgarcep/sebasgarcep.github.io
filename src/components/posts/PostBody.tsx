import { FC, useEffect, useState } from "react";
import Markdown from "react-markdown";
import hljs from "highlight.js";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import "highlight.js/styles/vs2015.css";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    hljs.highlightAll();
  }, [shouldRender]);

  useEffect(() => {
    setShouldRender(true);
  }, []);

  if (!shouldRender) return null;

  return (
    <Markdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code(attrs) {
          return attrs.className ? (
            <pre className="py-2">
              <code className={attrs.className}>{attrs.children}</code>
            </pre>
          ) : (
            <pre style={{ display: "inline-block" }}>
              <code
                className="language-sh"
                style={{ fontSize: "14px", padding: "5px" }}
              >
                {attrs.children}
              </code>
            </pre>
          );
        },
        p(attrs) {
          return <p className="my-4 text-gray-300">{attrs.children}</p>;
        },
        h1(attrs) {
          return <h1 className="text-2xl text-white">{attrs.children}</h1>;
        },
      }}
      className="text-white mt-2"
    >
      {text}
    </Markdown>
  );
};
