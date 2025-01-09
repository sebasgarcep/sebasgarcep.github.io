import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Mail } from "lucide-react";

import { PostBody } from "@/components/posts/PostBody";
import { PostTitle } from "@/components/posts/PostTitle";
import profileImg from "@/assets/profile.jpeg";
import { Link, useLoaderData } from "react-router-dom";
import { type loader } from "./loader";
import { LoaderType } from "@/lib/types";

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
    <div className="px-6">
      <img
        src={profileImg}
        className="rounded-full w-36 h-36 justify-self-center my-4"
      />
      <h1 className="text-gray-100 justify-self-center text-lg">{fullName}</h1>
      <h2 className="text-gray-100 justify-self-center">{jobTitle}</h2>
      <div className="flex flex-row gap-8 justify-center">
        {socialItems.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <Icon className="transition-all text-gray-300 hover:text-gray-100 h-5 w-5" />
            </Link>
          );
        })}
      </div>
      <PostTitle title={about.title} />
      <PostBody text={about.text} />
    </div>
  );
};
