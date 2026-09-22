"use client";

import { useEffect } from "react";

/**
 * Dynamically swaps the PWA manifest based on the ?app= URL param.
 * - ?app=admin → manifest-admin.json (admin app icon)
 * - ?app=customer → manifest-customer.json (customer app icon)
 * - (no param) → default manifest (no separate install target)
 *
 * This lets the admin / customer bookmark or "Add to home screen" their
 * respective URL and get a distinct icon + entry point on Android.
 */
export function ManifestSwitcher() {
  useEffect(() => {
    const applyManifest = () => {
      const params = new URLSearchParams(window.location.search);
      const app = params.get("app");
      const href =
        app === "admin"
          ? "/manifest-admin.json"
          : app === "customer"
          ? "/manifest-customer.json"
          : null;

      // Remove any existing dynamic manifest link we injected
      const existing = document.getElementById("dynamic-manifest");
      if (existing) existing.remove();

      if (href) {
        const link = document.createElement("link");
        link.rel = "manifest";
        link.href = href;
        link.id = "dynamic-manifest";
        document.head.appendChild(link);
      }
    };

    applyManifest();
    window.addEventListener("popstate", applyManifest);
    return () => window.removeEventListener("popstate", applyManifest);
  }, []);

  return null;
}
