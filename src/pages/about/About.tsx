import aboutMe from "@/assets/about.md?raw";
import { PostBody } from "@/components/posts/PostBody";
import { PostTitle } from "@/components/posts/PostTitle";
import { parseMarkdown } from "@/lib/markdown";

export const About = () => {
  const markdown = parseMarkdown(aboutMe);
  return (
    <div className="px-4">
      <PostTitle title={markdown.title} />
      <PostBody text={markdown.text} />
    </div>
  );
};
