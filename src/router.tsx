import { createBrowserRouter, RouteObject } from "react-router-dom";
import { route as indexRoute } from "./pages/_index/route";

export const routes: RouteObject[] = [indexRoute];

export const router = createBrowserRouter(routes);
