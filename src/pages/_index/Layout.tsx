import { Link, Outlet } from "react-router-dom";
import { Mail, Menu, Newspaper, Search, Tag, User } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import profileImg from "@/assets/profile.jpeg";

interface IMenuItem {
  path: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

interface ISocialItem {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const fullName = "Sebastian Garrido";
const jobTitle = "Software Engineer";

const menuItems: IMenuItem[] = [
  {
    path: "/posts/1",
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

const socialItems: ISocialItem[] = [
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
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
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
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground",
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {socialItems.map((item) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const Icon = item.icon;
                  return <Icon key={item.path} />;
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
