import { Link, Outlet } from "react-router-dom";
import { Mail, Newspaper, Tag, User } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

import profileImg from "@/assets/profile.jpeg";

interface MenuItem {
  path: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

interface SocialItem {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const fullName = "Sebastian Garrido";
const jobTitle = "Software Engineer";

const menuItems: MenuItem[] = [
  {
    path: "/posts",
    label: "Posts",
    icon: Newspaper,
  },
  {
    path: "/about",
    label: "About",
    icon: User,
  },
  {
    path: "/tags",
    label: "Tags",
    icon: Tag,
  },
];

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

export function Layout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <img src={profileImg} className="rounded-full w-36 h-36" />
              <h1>{fullName}</h1>
              <h2>{jobTitle}</h2>
              {menuItems.map((item) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const Icon = item.icon;
                const selected = false;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      selected
                        ? "bg-muted text-primary"
                        : "text-muted-foreground",
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {socialItems.map((item) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Icon className="transition-all hover:text-primary h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
