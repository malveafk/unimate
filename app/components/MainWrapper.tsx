"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Opacity-only transition — intentionally NO transform or filter on the wrapper.
// Any CSS transform/filter on a parent breaks position:fixed children (per CSS spec,
// transformed ancestors become the containing block for fixed elements). The home page
// hero uses position:fixed, so we must keep the wrapper transform-free.
export function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
