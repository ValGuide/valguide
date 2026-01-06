import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { A as AuthProvider, a as AuthLayout$1, c as cn } from "./utils-Ez3IsOO4.mjs";
import "next-intl/navigation";
import "next-intl/routing";
import "./dynamic-rendering-heOuaD5V.mjs";
import "next-intl";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "zod";
import "react-dom";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { "data-slot": "skeleton", className: cn("bg-accent animate-pulse rounded-md", className), ...props });
}
function AuthSkeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col justify-center space-y-8", className), ...props, children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-40 mx-auto" }),
      " ",
      /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-64 mx-auto" }),
      " "
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-32" }),
        " ",
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }),
        " "
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }),
      " ",
      /* @__PURE__ */ jsxs("div", { className: "text-center mt-4", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-48 mx-auto" }),
        " "
      ] })
    ] })
  ] });
}
function OtpSkeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col justify-center space-y-6", className), ...props, children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-48 mx-auto" }),
      " ",
      /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-80 mx-auto" }),
      " "
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " ",
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " ",
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " "
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " ",
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " ",
          /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-12 rounded-md" }),
          " "
        ] })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full rounded-md" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-56 mx-auto" }),
        " "
      ] })
    ] })
  ] });
}
function AuthSkeletonContainer({ className, showOtp = false, ...props }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: cn("flex flex-1 flex-col justify-center mt-16 mb-8", className), ...props, children: showOtp ? /* @__PURE__ */ jsx(OtpSkeleton, {}) : /* @__PURE__ */ jsx(AuthSkeleton, {}) }),
    /* @__PURE__ */ jsx("div", { className: "w-full pt-10", children: /* @__PURE__ */ jsx("div", { className: "text-center max-w-md mx-auto", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-96 mx-auto" }) }) })
  ] });
}
function LoginLoading() {
  return /* @__PURE__ */ jsx(AuthLayout$1, { children: /* @__PURE__ */ jsx(AuthSkeletonContainer, {}) });
}
function AuthLayout() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(LoginLoading, {}), children: /* @__PURE__ */ jsx(AuthProvider, { isLogin: true, children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
export {
  AuthLayout as component
};
