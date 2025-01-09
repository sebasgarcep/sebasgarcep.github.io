import { LoaderType } from "@/lib/types";
import { Link, useLoaderData } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { type loader } from "./loader";
import { PostTitle } from "@/components/posts/PostTitle";
import { PostDate } from "@/components/posts/PostDate";
import { PostBody } from "@/components/posts/PostBody";
import { TagList } from "@/components/tags/TagList";
import { FC } from "react";
import { cn } from "@/lib/utils";
import { useNavigationStateListener } from "@/context/navigation";

export const ReadPost = () => {
  const { post, previousPost, nextPost } = useLoaderData() as LoaderType<
    typeof loader
  >;

  useNavigationStateListener((current, previous) => {
    if (previous && current.pathname !== previous.pathname) {
      window.scrollTo(0, 0);
    }
  });

  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <div className="px-6">
        <PostTitle title={post.title} />
        <PostDate date={new Date(post.date)} />
        <PostBody text={post.text} />
        <div className="my-8">
          {post.tags ? <TagList tags={post.tags} /> : null}
        </div>
        <div className="flex flex-row mb-8">
          <ReadAnotherButton
            label="Previous"
            title={previousPost?.title ?? "-"}
            redirect={previousPost && `/read/${previousPost.id}`}
            className="rounded-l-sm"
          />
          <ReadAnotherButton
            label="Next"
            title={nextPost?.title ?? "-"}
            redirect={nextPost && `/read/${nextPost.id}`}
            className="rounded-r-sm"
          />
        </div>
      </div>
    </>
  );
};

interface ReadAnotherButtonProps {
  label: string;
  title: string;
  className?: string;
  redirect: string | null;
}

const ReadAnotherButton: FC<ReadAnotherButtonProps> = ({
  label,
  title,
  redirect,
  className,
}) => {
  const parentClassName = cn(
    "border flex-1 transition-all p-4",
    redirect && "hover:bg-muted/20",
    className,
  );

  const content = (
    <>
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-gray-100">{title}</div>
    </>
  );

  return redirect ? (
    <Link to={redirect} className={parentClassName}>
      {content}
    </Link>
  ) : (
    <div className={parentClassName}>{content}</div>
  );
};
