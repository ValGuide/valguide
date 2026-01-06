import { jsx, jsxs } from "react/jsx-runtime";
import { u as useAuth, a as AuthLayout, L as Link, c as cn, b as clsx } from "./utils-Ez3IsOO4.mjs";
import { useTranslations } from "next-intl";
import * as n from "react";
import { useState } from "react";
import "@tanstack/react-router";
import "next-intl/navigation";
import "next-intl/routing";
import "./dynamic-rendering-heOuaD5V.mjs";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "zod";
import "react-dom";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = n.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = n.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (n.Children.count(newElement) > 1) return n.Children.only(null);
          return n.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: n.isValidElement(newElement) ? n.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = n.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (n.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== n.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return n.cloneElement(children, props2);
    }
    return n.Children.count(children) > 1 ? n.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
  return n.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
const falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config) => (props) => {
  var _config_compoundVariants;
  if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const { variants, defaultVariants } = config;
  const getVariantClassNames = Object.keys(variants).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [
      ...acc,
      cvClass,
      cvClassName
    ] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(Comp, { "data-slot": "button", className: cn(buttonVariants({ variant, size, className })), ...props });
}
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot2 = /* @__PURE__ */ createSlot(`Primitive.${node}`);
  const Node = n.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot2 : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
var NAME = "Label";
var Label$1 = n.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        props.onMouseDown?.(event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label$1.displayName = NAME;
var Root = Label$1;
function Label({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function FieldGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "field-group",
      className: cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      ),
      ...props
    }
  );
}
const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
      horizontal: [
        "flex-row items-center",
        "[&>[data-slot=field-label]]:flex-auto",
        "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
      ],
      responsive: [
        "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
        "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
        "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
      ]
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});
function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className),
      ...props
    }
  );
}
function FieldLabel({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      ),
      ...props
    }
  );
}
function FieldDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "field-description",
      className: cn(
        "text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function AuthForm({
  email: initialEmail,
  onEmailChange,
  onSubmit,
  loading = false,
  submitText,
  loadingText,
  emailLabel,
  emailPlaceholder,
  isLogin = false
}) {
  const t = useTranslations(isLogin ? "login" : "signup");
  const [error, setError] = useState(null);
  function handleSubmit(e) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!initialEmail) {
      setError(t("emailRequired"));
      return;
    }
    if (!emailRegex.test(initialEmail)) {
      setError(t("invalidEmail"));
      return;
    }
    setError(null);
    onSubmit(initialEmail);
  }
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "space-y-6", noValidate: true, children: /* @__PURE__ */ jsxs(FieldGroup, { children: [
    /* @__PURE__ */ jsxs(Field, { children: [
      /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "email", children: emailLabel }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "email",
          placeholder: emailPlaceholder,
          type: "email",
          autoComplete: "email",
          value: initialEmail,
          onChange: (e) => {
            onEmailChange(e.target.value);
            setError(null);
          },
          required: true
        }
      ),
      error && /* @__PURE__ */ jsx(FieldDescription, { className: "text-destructive", children: error })
    ] }),
    /* @__PURE__ */ jsx(Field, { children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? loadingText : submitText }) }),
    /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
      isLogin ? t("noAccount") : t("haveAccount"),
      " ",
      /* @__PURE__ */ jsx(Link, { href: isLogin ? "/signup" : "/login", className: "text-secondary-foreground hover:underline", children: isLogin ? t("signupLink") : t("loginLink") })
    ] }) })
  ] }) }) });
}
const Consent = () => {
  const commonT = useTranslations("common");
  return /* @__PURE__ */ jsx(FieldDescription, { className: "text-center", children: commonT.rich("consentMessage", {
    termsLink: (chunks) => /* @__PURE__ */ jsx(Link, { href: "/terms-of-service", className: "hover:underline", children: chunks }),
    privacyLink: (chunks) => /* @__PURE__ */ jsx(Link, { href: "/privacy-policy", className: "hover:underline", children: chunks })
  }) });
};
var Bt = Object.defineProperty, At = Object.defineProperties;
var kt = Object.getOwnPropertyDescriptors;
var Y = Object.getOwnPropertySymbols;
var gt = Object.prototype.hasOwnProperty, Et = Object.prototype.propertyIsEnumerable;
var vt = (r, s, e) => s in r ? Bt(r, s, { enumerable: true, configurable: true, writable: true, value: e }) : r[s] = e, St = (r, s) => {
  for (var e in s || (s = {})) gt.call(s, e) && vt(r, e, s[e]);
  if (Y) for (var e of Y(s)) Et.call(s, e) && vt(r, e, s[e]);
  return r;
}, bt = (r, s) => At(r, kt(s));
var Pt = (r, s) => {
  var e = {};
  for (var u in r) gt.call(r, u) && s.indexOf(u) < 0 && (e[u] = r[u]);
  if (r != null && Y) for (var u of Y(r)) s.indexOf(u) < 0 && Et.call(r, u) && (e[u] = r[u]);
  return e;
};
function ht(r) {
  let s = setTimeout(r, 0), e = setTimeout(r, 10), u = setTimeout(r, 50);
  return [s, e, u];
}
function _t(r) {
  let s = n.useRef();
  return n.useEffect(() => {
    s.current = r;
  }), s.current;
}
var Ot = 18, wt = 40, Gt = `${wt}px`, xt = ["[data-lastpass-icon-root]", "com-1password-button", "[data-dashlanecreated]", '[style$="2147483647 !important;"]'].join(",");
function Tt({ containerRef: r, inputRef: s, pushPasswordManagerStrategy: e, isFocused: u }) {
  let [P, D] = n.useState(false), [G, H] = n.useState(false), [F, W] = n.useState(false), Z = n.useMemo(() => e === "none" ? false : (e === "increase-width" || e === "experimental-no-flickering") && P && G, [P, G, e]), T = n.useCallback(() => {
    let f = r.current, h = s.current;
    if (!f || !h || F || e === "none") return;
    let a = f, B = a.getBoundingClientRect().left + a.offsetWidth, A = a.getBoundingClientRect().top + a.offsetHeight / 2, z = B - Ot, q = A;
    document.querySelectorAll(xt).length === 0 && document.elementFromPoint(z, q) === f || (D(true), W(true));
  }, [r, s, F, e]);
  return n.useEffect(() => {
    let f = r.current;
    if (!f || e === "none") return;
    function h() {
      let A = window.innerWidth - f.getBoundingClientRect().right;
      H(A >= wt);
    }
    h();
    let a = setInterval(h, 1e3);
    return () => {
      clearInterval(a);
    };
  }, [r, e]), n.useEffect(() => {
    let f = u || document.activeElement === s.current;
    if (e === "none" || !f) return;
    let h = setTimeout(T, 0), a = setTimeout(T, 2e3), B = setTimeout(T, 5e3), A = setTimeout(() => {
      W(true);
    }, 6e3);
    return () => {
      clearTimeout(h), clearTimeout(a), clearTimeout(B), clearTimeout(A);
    };
  }, [s, u, e, T]), { hasPWMBadge: P, willPushPWMBadge: Z, PWM_BADGE_SPACE_WIDTH: Gt };
}
var jt = n.createContext({}), Lt = n.forwardRef((A, B) => {
  var z = A, { value: r, onChange: s, maxLength: e, textAlign: u = "left", pattern: P, placeholder: D, inputMode: G = "numeric", onComplete: H, pushPasswordManagerStrategy: F = "increase-width", pasteTransformer: W, containerClassName: Z, noScriptCSSFallback: T = Nt, render: f, children: h } = z, a = Pt(z, ["value", "onChange", "maxLength", "textAlign", "pattern", "placeholder", "inputMode", "onComplete", "pushPasswordManagerStrategy", "pasteTransformer", "containerClassName", "noScriptCSSFallback", "render", "children"]);
  var X, lt, ut, dt, ft;
  let [q, nt] = n.useState(typeof a.defaultValue == "string" ? a.defaultValue : ""), i = r != null ? r : q, I = _t(i), x = n.useCallback((t) => {
    s == null || s(t), nt(t);
  }, [s]), m = n.useMemo(() => P ? typeof P == "string" ? new RegExp(P) : P : null, [P]), l = n.useRef(null), K = n.useRef(null), J = n.useRef({ value: i, onChange: x, isIOS: typeof window != "undefined" && ((lt = (X = window == null ? void 0 : window.CSS) == null ? void 0 : X.supports) == null ? void 0 : lt.call(X, "-webkit-touch-callout", "none")) }), V = n.useRef({ prev: [(ut = l.current) == null ? void 0 : ut.selectionStart, (dt = l.current) == null ? void 0 : dt.selectionEnd, (ft = l.current) == null ? void 0 : ft.selectionDirection] });
  n.useImperativeHandle(B, () => l.current, []), n.useEffect(() => {
    let t = l.current, o = K.current;
    if (!t || !o) return;
    J.current.value !== t.value && J.current.onChange(t.value), V.current.prev = [t.selectionStart, t.selectionEnd, t.selectionDirection];
    function d() {
      if (document.activeElement !== t) {
        L(null), N(null);
        return;
      }
      let c = t.selectionStart, b = t.selectionEnd, mt = t.selectionDirection, v = t.maxLength, C = t.value, _ = V.current.prev, g = -1, E = -1, w;
      if (C.length !== 0 && c !== null && b !== null) {
        let Dt = c === b, Ht = c === C.length && C.length < v;
        if (Dt && !Ht) {
          let y = c;
          if (y === 0) g = 0, E = 1, w = "forward";
          else if (y === v) g = y - 1, E = y, w = "backward";
          else if (v > 1 && C.length > 1) {
            let et = 0;
            if (_[0] !== null && _[1] !== null) {
              w = y < _[1] ? "backward" : "forward";
              let Wt = _[0] === _[1] && _[0] < v;
              w === "backward" && !Wt && (et = -1);
            }
            g = et + y, E = et + y + 1;
          }
        }
        g !== -1 && E !== -1 && g !== E && l.current.setSelectionRange(g, E, w);
      }
      let pt = g !== -1 ? g : c, Rt = E !== -1 ? E : b, yt = w != null ? w : mt;
      L(pt), N(Rt), V.current.prev = [pt, Rt, yt];
    }
    if (document.addEventListener("selectionchange", d, { capture: true }), d(), document.activeElement === t && Q(true), !document.getElementById("input-otp-style")) {
      let c = document.createElement("style");
      if (c.id = "input-otp-style", document.head.appendChild(c), c.sheet) {
        let b = "background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";
        $(c.sheet, "[data-input-otp]::selection { background: transparent !important; color: transparent !important; }"), $(c.sheet, `[data-input-otp]:autofill { ${b} }`), $(c.sheet, `[data-input-otp]:-webkit-autofill { ${b} }`), $(c.sheet, "@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }"), $(c.sheet, "[data-input-otp] + * { pointer-events: all !important; }");
      }
    }
    let R = () => {
      o && o.style.setProperty("--root-height", `${t.clientHeight}px`);
    };
    R();
    let p = new ResizeObserver(R);
    return p.observe(t), () => {
      document.removeEventListener("selectionchange", d, { capture: true }), p.disconnect();
    };
  }, []);
  let [ot, rt] = n.useState(false), [j, Q] = n.useState(false), [M, L] = n.useState(null), [k, N] = n.useState(null);
  n.useEffect(() => {
    ht(() => {
      var R, p, c, b;
      (R = l.current) == null || R.dispatchEvent(new Event("input"));
      let t = (p = l.current) == null ? void 0 : p.selectionStart, o = (c = l.current) == null ? void 0 : c.selectionEnd, d = (b = l.current) == null ? void 0 : b.selectionDirection;
      t !== null && o !== null && (L(t), N(o), V.current.prev = [t, o, d]);
    });
  }, [i, j]), n.useEffect(() => {
    I !== void 0 && i !== I && I.length < e && i.length === e && (H == null || H(i));
  }, [e, H, I, i]);
  let O = Tt({ containerRef: K, inputRef: l, pushPasswordManagerStrategy: F, isFocused: j }), st = n.useCallback((t) => {
    let o = t.currentTarget.value.slice(0, e);
    if (o.length > 0 && m && !m.test(o)) {
      t.preventDefault();
      return;
    }
    typeof I == "string" && o.length < I.length && document.dispatchEvent(new Event("selectionchange")), x(o);
  }, [e, x, I, m]), at = n.useCallback(() => {
    var t;
    if (l.current) {
      let o = Math.min(l.current.value.length, e - 1), d = l.current.value.length;
      (t = l.current) == null || t.setSelectionRange(o, d), L(o), N(d);
    }
    Q(true);
  }, [e]), ct = n.useCallback((t) => {
    var g, E;
    let o = l.current;
    if (!W && (!J.current.isIOS || !t.clipboardData || !o)) return;
    let d = t.clipboardData.getData("text/plain"), R = W ? W(d) : d;
    t.preventDefault();
    let p = (g = l.current) == null ? void 0 : g.selectionStart, c = (E = l.current) == null ? void 0 : E.selectionEnd, v = (p !== c ? i.slice(0, p) + R + i.slice(c) : i.slice(0, p) + R + i.slice(p)).slice(0, e);
    if (v.length > 0 && m && !m.test(v)) return;
    o.value = v, x(v);
    let C = Math.min(v.length, e - 1), _ = v.length;
    o.setSelectionRange(C, _), L(C), N(_);
  }, [e, x, m, i]), It = n.useMemo(() => ({ position: "relative", cursor: a.disabled ? "default" : "text", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }), [a.disabled]), it = n.useMemo(() => ({ position: "absolute", inset: 0, width: O.willPushPWMBadge ? `calc(100% + ${O.PWM_BADGE_SPACE_WIDTH})` : "100%", clipPath: O.willPushPWMBadge ? `inset(0 ${O.PWM_BADGE_SPACE_WIDTH} 0 0)` : void 0, height: "100%", display: "flex", textAlign: u, opacity: "1", color: "transparent", pointerEvents: "all", background: "transparent", caretColor: "transparent", border: "0 solid transparent", outline: "0 solid transparent", boxShadow: "none", lineHeight: "1", letterSpacing: "-.5em", fontSize: "var(--root-height)", fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }), [O.PWM_BADGE_SPACE_WIDTH, O.willPushPWMBadge, u]), Mt = n.useMemo(() => n.createElement("input", bt(St({ autoComplete: a.autoComplete || "one-time-code" }, a), { "data-input-otp": true, "data-input-otp-placeholder-shown": i.length === 0 || void 0, "data-input-otp-mss": M, "data-input-otp-mse": k, inputMode: G, pattern: m == null ? void 0 : m.source, "aria-placeholder": D, style: it, maxLength: e, value: i, ref: l, onPaste: (t) => {
    var o;
    ct(t), (o = a.onPaste) == null || o.call(a, t);
  }, onChange: st, onMouseOver: (t) => {
    var o;
    rt(true), (o = a.onMouseOver) == null || o.call(a, t);
  }, onMouseLeave: (t) => {
    var o;
    rt(false), (o = a.onMouseLeave) == null || o.call(a, t);
  }, onFocus: (t) => {
    var o;
    at(), (o = a.onFocus) == null || o.call(a, t);
  }, onBlur: (t) => {
    var o;
    Q(false), (o = a.onBlur) == null || o.call(a, t);
  } })), [st, at, ct, G, it, e, k, M, a, m == null ? void 0 : m.source, i]), tt = n.useMemo(() => ({ slots: Array.from({ length: e }).map((t, o) => {
    var c;
    let d = j && M !== null && k !== null && (M === k && o === M || o >= M && o < k), R = i[o] !== void 0 ? i[o] : null, p = i[0] !== void 0 ? null : (c = D == null ? void 0 : D[o]) != null ? c : null;
    return { char: R, placeholderChar: p, isActive: d, hasFakeCaret: d && R === null };
  }), isFocused: j, isHovering: !a.disabled && ot }), [j, ot, e, k, M, a.disabled, i]), Ct = n.useMemo(() => f ? f(tt) : n.createElement(jt.Provider, { value: tt }, h), [h, tt, f]);
  return n.createElement(n.Fragment, null, T !== null && n.createElement("noscript", null, n.createElement("style", null, T)), n.createElement("div", { ref: K, "data-input-otp-container": true, style: It, className: Z }, Ct, n.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" } }, Mt)));
});
Lt.displayName = "Input";
function $(r, s) {
  try {
    r.insertRule(s);
  } catch (e) {
    console.error("input-otp could not insert CSS rule:", s);
  }
}
var Nt = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`;
function InputOTP({
  className,
  containerClassName,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Lt,
    {
      "data-slot": "input-otp",
      containerClassName: cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName),
      className: cn("disabled:cursor-not-allowed", className),
      ...props
    }
  );
}
function InputOTPGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { "data-slot": "input-otp-group", className: cn("flex items-center", className), ...props });
}
function InputOTPSlot({
  index,
  className,
  ...props
}) {
  const inputOTPContext = n.useContext(jt);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "input-otp-slot",
      "data-active": isActive,
      className: cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-caret-blink bg-foreground h-4 w-px duration-1000" }) })
      ]
    }
  );
}
function OtpVerificationForm({
  otp: _otp,
  onOtpChange,
  onSubmit,
  onResendClick,
  loading = false,
  title,
  isLogin = false
}) {
  const t = useTranslations(isLogin ? "login" : "signup");
  return /* @__PURE__ */ jsx("form", { onSubmit, children: /* @__PURE__ */ jsxs(FieldGroup, { children: [
    title && /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-2 text-center", children: /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: title }) }),
    /* @__PURE__ */ jsxs(Field, { children: [
      /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "otp", className: "sr-only", children: t("otpPlaceholder") }),
      /* @__PURE__ */ jsxs(
        InputOTP,
        {
          maxLength: 6,
          id: "otp",
          disabled: loading,
          containerClassName: "gap-4 justify-center",
          onComplete: (value) => {
            const syntheticEvent = {
              target: {
                value
              }
            };
            onOtpChange(syntheticEvent);
          },
          onChange: (value) => {
            const syntheticEvent = {
              target: {
                value
              }
            };
            onOtpChange(syntheticEvent);
          },
          children: [
            /* @__PURE__ */ jsxs(InputOTPGroup, { className: "gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl", children: [
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 0 }),
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 1 }),
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 2 })
            ] }),
            /* @__PURE__ */ jsxs(InputOTPGroup, { className: "gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl", children: [
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 3 }),
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 4 }),
              /* @__PURE__ */ jsx(InputOTPSlot, { index: 5 })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Field, { children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? t("verifying") : t("verifyCode") }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-sm", children: [
      t("didntReceiveEmail"),
      " ",
      /* @__PURE__ */ jsx("button", { type: "button", className: "font-medium hover:underline", onClick: onResendClick, children: t("resendCode") })
    ] })
  ] }) });
}
function MessageAlert({ type, children, show = true }) {
  if (!show) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `mt-4 p-4 rounded-md flex items-start ${type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`,
      role: "alert",
      children: [
        /* @__PURE__ */ jsx("div", { className: "shrink-0 mr-3", children: type === "success" ? /* @__PURE__ */ jsx("svg", { "aria-hidden": "true", className: "h-5 w-5 text-green-600", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
          "path",
          {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
            clipRule: "evenodd"
          }
        ) }) : /* @__PURE__ */ jsx("svg", { "aria-hidden": "true", className: "h-5 w-5 text-red-600", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
          "path",
          {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
            clipRule: "evenodd"
          }
        ) }) }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children })
      ]
    }
  );
}
function AuthContainer({
  // Auth state and handlers
  email,
  setEmail,
  otp,
  setOtp,
  handleEmailAuth,
  handleVerifyOtp,
  handleResendOtp,
  loading,
  message,
  verifyingOtp,
  isLogin
}) {
  const t = useTranslations(isLogin ? "login" : "signup");
  return /* @__PURE__ */ jsxs(AuthLayout, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-center gap-6", children: [
      verifyingOtp ? /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "mt-6 text-3xl font-bold tracking-tight", children: t("otpTitle") }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm ", children: email ? `${t("verifyEmail")} ${email}` : t("checkEmail") })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "mt-6 text-3xl font-bold tracking-tight", children: t("welcome") }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: t(isLogin ? "loginPrompt" : "signupPrompt") })
      ] }),
      message && /* @__PURE__ */ jsx(MessageAlert, { type: message.type, children: message.text }),
      verifyingOtp ? /* @__PURE__ */ jsx(
        OtpVerificationForm,
        {
          otp,
          onOtpChange: (e) => setOtp(e.target.value),
          onSubmit: handleVerifyOtp,
          onResendClick: handleResendOtp,
          loading,
          isLogin
        }
      ) : /* @__PURE__ */ jsx(
        AuthForm,
        {
          email,
          onEmailChange: setEmail,
          onSubmit: handleEmailAuth,
          loading,
          submitText: t("sendCode"),
          loadingText: t("sending"),
          emailLabel: t("emailLabel"),
          emailPlaceholder: t("emailPlaceholder"),
          isLogin
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Consent, {})
  ] });
}
function LoginContainer() {
  const {
    handleEmailAuth,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
    loading,
    message,
    verifyingOtp,
    email,
    setEmail
  } = useAuth();
  return /* @__PURE__ */ jsx(
    AuthContainer,
    {
      email,
      setEmail,
      otp,
      setOtp,
      handleEmailAuth,
      handleVerifyOtp,
      handleResendOtp,
      loading,
      message,
      verifyingOtp,
      isLogin: true
    }
  );
}
const SplitComponent = LoginContainer;
export {
  SplitComponent as component
};
