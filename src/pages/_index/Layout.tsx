import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Newspaper, Tag, User } from "lucide-react";
import { Head } from "vite-react-ssg";
import { NavigationContextProvider } from "@/context/navigation";
import { useEffect } from "react";

interface MenuItem {
  path: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const menuItems: MenuItem[] = [
  {
    path: "/posts",
    label: "Posts",
    icon: Newspaper,
  },
  {
    path: "/about",
    label: "About Me",
    icon: User,
  },
  {
    path: "/tags",
    label: "Tags",
    icon: Tag,
  },
];

export function Index() {
  return (
    <>
      <Head>
        <title>Sebastian&apos;s Blog</title>
      </Head>
      <ScrollRestoration />
      <NavigationContextProvider>
        <Layout />
      </NavigationContextProvider>
    </>
  );
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/posts");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="bg-slate-900 flex flex-col min-h-screen max-w-full items-center">
      <header className="flex flex-row gap-8 justify-center py-4">
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
      </header>

      <main className="max-w-sm md:max-w-2xl text-justify">
        <Outlet />
      </main>
    </div>
  );
}
