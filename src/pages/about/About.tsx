import aboutMe from "@/assets/about.md?raw";
import { parseMarkdown } from "@/lib/markdown";

export const About = () => {
  const markdown = parseMarkdown(aboutMe);
  return (
    <div>
      <h1>{markdown.title}</h1>
      <span>{markdown.text}</span>
    </div>
  );
};
