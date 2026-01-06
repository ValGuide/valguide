import { createRouter, createRootRoute, createFileRoute, lazyRouteComponent, HeadContent, Scripts } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
const appCss = "/assets/globals-DvCMD_7H.css";
const Route$3 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "TanStack Start Starter"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$2 = () => import("./_auth-c2cxkDhV.mjs");
const Route$2 = createFileRoute("/_auth")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-CH3fbEld.mjs");
const Route$1 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./login-ObOQnvL_.mjs");
const Route = createFileRoute("/_auth/login")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AuthRoute = Route$2.update({
  id: "/_auth",
  getParentRoute: () => Route$3
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const AuthLoginRoute = Route.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AuthRoute
});
const AuthRouteChildren = {
  AuthLoginRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthRoute: AuthRouteWithChildren
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
