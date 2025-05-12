"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AuthProvider: () => AuthProvider,
  ProtectedRoute: () => ProtectedRoute,
  createSupabaseClient: () => createSupabaseClient,
  isSupabaseConfigured: () => isSupabaseConfigured,
  useAuth: () => useAuth
});
module.exports = __toCommonJS(src_exports);

// src/AuthContext.tsx
var import_react = __toESM(require("react"));
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var AuthContext = import_react.default.createContext(void 0);
var AuthProvider = ({
  children,
  supabaseClient
}) => {
  const [session, setSession] = (0, import_react2.useState)(null);
  const [user, setUser] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  (0, import_react2.useEffect)(() => {
    const getSession = async () => {
      var _a;
      setLoading(true);
      const { data: { session: session2 }, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      } else {
        setSession(session2);
        setUser((_a = session2 == null ? void 0 : session2.user) != null ? _a : null);
      }
      setLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, currentSession) => {
        var _a;
        setSession(currentSession);
        setUser((_a = currentSession == null ? void 0 : currentSession.user) != null ? _a : null);
        setLoading(false);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);
  const signIn = async (email, password) => {
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      return {
        error,
        success: !error
      };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      return {
        error,
        success: false
      };
    }
  };
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return {
        error,
        success: !error
      };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return {
        error,
        success: false
      };
    }
  };
  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      return {
        error,
        success: !error
      };
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      return {
        error,
        success: false
      };
    }
  };
  const resetPassword = async (email) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : void 0
      });
      return {
        error,
        success: !error
      };
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      return {
        error,
        success: false
      };
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    AuthContext.Provider,
    {
      value: {
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword
      },
      children
    }
  );
};
var useAuth = () => {
  const context = (0, import_react2.useContext)(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// src/ProtectedRoute.tsx
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var ProtectedRoute = ({
  children,
  redirectTo = "/login",
  router,
  loadingComponent
}) => {
  const { user, loading } = useAuth();
  (0, import_react3.useEffect)(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);
  if (loading) {
    if (loadingComponent) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: loadingComponent });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex justify-center items-center min-h-screen", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" }) });
  }
  return user ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children }) : null;
};

// src/supabase.ts
var import_supabase_js = require("@supabase/supabase-js");
var createSupabaseClient = (supabaseUrl, supabaseAnonKey) => {
  return (0, import_supabase_js.createClient)(supabaseUrl, supabaseAnonKey);
};
function isSupabaseConfigured(supabaseUrl, supabaseAnonKey) {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProvider,
  ProtectedRoute,
  createSupabaseClient,
  isSupabaseConfigured,
  useAuth
});
