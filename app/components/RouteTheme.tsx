"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Temporary test hook: applies a light-theme override (see body.theme-light
 * in globals.css) only while browsing /universities, so it can be compared
 * side by side with the rest of the (still dark) site. Remove this component
 * — and the .theme-light block in globals.css — once a direction is picked.
 */
export function RouteTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const isLight = pathname?.startsWith("/universities") ?? false;
    document.body.classList.toggle("theme-light", isLight);
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, [pathname]);

  return null;
}
