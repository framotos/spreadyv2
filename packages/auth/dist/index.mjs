// src/AuthContext.tsx
import React from "react";
import { useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var AuthContext = React.createContext(void 0);
var AuthProvider = ({
  children,
  supabaseClient
}) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(
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
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// src/ProtectedRoute.tsx
import { useEffect as useEffect2 } from "react";
import { Fragment, jsx as jsx2 } from "react/jsx-runtime";
var ProtectedRoute = ({
  children,
  redirectTo = "/login",
  router,
  loadingComponent
}) => {
  const { user, loading } = useAuth();
  useEffect2(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);
  if (loading) {
    if (loadingComponent) {
      return /* @__PURE__ */ jsx2(Fragment, { children: loadingComponent });
    }
    return /* @__PURE__ */ jsx2("div", { className: "flex justify-center items-center min-h-screen", children: /* @__PURE__ */ jsx2("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" }) });
  }
  return user ? /* @__PURE__ */ jsx2(Fragment, { children }) : null;
};

// src/supabase.ts
import { createClient } from "@supabase/supabase-js";
var createSupabaseClient = (supabaseUrl, supabaseAnonKey) => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
function isSupabaseConfigured(supabaseUrl, supabaseAnonKey) {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
export {
  AuthProvider,
  ProtectedRoute,
  createSupabaseClient,
  isSupabaseConfigured,
  useAuth
};
