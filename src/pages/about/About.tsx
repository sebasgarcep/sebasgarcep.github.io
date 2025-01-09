import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Mail } from "lucide-react";

import { PostBody } from "@/components/posts/PostBody";
import { PostTitle } from "@/components/posts/PostTitle";
import profileImg from "@/assets/profile.jpeg";
import { Link, useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";
import { Head } from "vite-react-ssg";

const fullName = "Sebastian Garrido";
const jobTitle = "Software Engineer";

interface SocialItem {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const socialItems: SocialItem[] = [
  {
    path: "https://github.com/sebasgarcep",
    icon: GitHubLogoIcon,
  },
  {
    path: "https://www.linkedin.com/in/sebastian-garrido-cepeda-20b090152/",
    icon: LinkedInLogoIcon,
  },
  {
    path: "mailto:sebasgarcep@gmail.com",
    icon: Mail,
  },
];

export const About = () => {
  const { about } = useLoaderData() as LoaderType<typeof loader>;
  return (
    <>
      <Head>
        <title>About Me</title>
      </Head>
      <div className="px-6 grid grid-cols-1 md:grid-cols-2">
        <div className="mb-4 flex flex-col items-center">
          <img
            src={profileImg}
            className="rounded-full w-36 h-36 justify-self-center my-4"
          />
          <h1 className="text-gray-100 justify-self-center text-lg">
            {fullName}
          </h1>
          <h2 className="text-gray-100 justify-self-center">{jobTitle}</h2>
          <div className="flex flex-row gap-8 justify-center mt-4">
            {socialItems.map((item) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Icon className="transition-all text-gray-300 hover:text-gray-100 h-6 w-6" />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <PostTitle title={about.title} />
          <PostBody text={about.text} />
        </div>
      </div>
    </>
  );
};
