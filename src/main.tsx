import { RouteRecord, ViteReactSSG } from "vite-react-ssg";
import { route as indexRoute } from "./pages/_index/route";
import "./index.css";
import "./main.css";

const routes: RouteRecord[] = [indexRoute];

export const createRoot = ViteReactSSG({ routes });
