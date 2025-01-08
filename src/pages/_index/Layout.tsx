import { Link, Outlet } from "react-router-dom";
import { Mail, Menu, Newspaper, Tag, User } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <div className="bg-slate-800 grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-slate-800 border-r-0"
            >
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        <main className="max-w-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <img
        src={profileImg}
        className="rounded-full w-36 h-36 justify-self-center my-4"
      />
      <h1 className="text-gray-100 justify-self-center text-lg">{fullName}</h1>
      <h2 className="text-gray-100 justify-self-center">{jobTitle}</h2>
      <div className="mb-4" />
      {menuItems.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-gray-300 hover:text-gray-100"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="mb-6" />
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
    </nav>
  );
}
