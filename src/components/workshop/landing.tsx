"use client";

import { useState, useEffect } from "react";
import { AdminLogin } from "./admin-login";
import { CustomerLogin } from "./customer-login";
import { AdminDashboard } from "./admin-dashboard";
import { CustomerDashboard } from "./customer-dashboard";
import { MarketingLanding } from "./marketing-landing";
import { useAppStore } from "@/lib/session";

type View = "marketing" | "admin-login" | "customer-login";

/**
 * Reads the `?app=` query param to determine the entry mode:
 *  - ?app=admin → straight to admin login (the "Admin App")
 *  - ?app=customer → straight to customer login (the "Customer App")
 *  - (no param) → marketing landing page with both buttons
 *
 * Each role gets its own URL, so the admin and customer "apps" can be
 * bookmarked / installed separately on phones.
 */
function getInitialView(): View {
  if (typeof window === "undefined") return "marketing";
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("app");
  if (mode === "admin") return "admin-login";
  if (mode === "customer") return "customer-login";
  return "marketing";
}

function setViewOnUrl(view: View) {
  const url = view === "admin-login" ? "/?app=admin" : view === "customer-login" ? "/?app=customer" : "/";
  window.history.replaceState({}, "", url);
}

export function Landing() {
  const admin = useAppStore((s) => s.admin);
  const customer = useAppStore((s) => s.customer);
  // useState initializer runs once on the client (during hydration it returns
  // a default; the effect below re-syncs with the URL on mount + popstate).
  const [view, setView] = useState<View>(() =>
    typeof window === "undefined" ? "marketing" : getInitialView()
  );

  // Listen to URL changes (back/forward) so the view stays in sync.
  useEffect(() => {
    const onPop = () => setView(getInitialView());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // If already logged in, go straight to dashboard (regardless of ?app=)
  if (admin) return <AdminDashboard />;
  if (customer) return <CustomerDashboard />;

  function pick(v: View) {
    setViewOnUrl(v);
    setView(v);
  }

  if (view === "admin-login") {
    return <AdminLogin onBack={() => pick("marketing")} />;
  }
  if (view === "customer-login") {
    return <CustomerLogin onBack={() => pick("marketing")} />;
  }
  return <MarketingLanding onPick={pick} />;
}
