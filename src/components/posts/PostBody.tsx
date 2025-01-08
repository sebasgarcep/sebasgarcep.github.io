import { FC, useEffect } from "react";
import Markdown from "react-markdown";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

export interface PostBodyProps {
  text: string;
}

export const PostBody: FC<PostBodyProps> = ({ text }) => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <Markdown
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
                style={{ fontSize: "12px", padding: "5px" }}
              >
                {attrs.children}
              </code>
            </pre>
          );
        },
      }}
      className="text-white mt-2"
    >
      {text}
    </Markdown>
  );
};
