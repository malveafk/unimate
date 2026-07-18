"use client";

import {
  AnchorHTMLAttributes,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Journey sequence ──────────────────────────────────────────────────────
// The four routes form a narrative order. We use this to determine
// whether a navigation is "forward" (deeper into the journey) or "backward".
const JOURNEY: string[] = ["/", "/universities", "/compare", "/chat"];

function journeyIndex(href: string): number {
  const exact = JOURNEY.indexOf(href);
  if (exact !== -1) return exact;
  for (let i = JOURNEY.length - 1; i >= 0; i--) {
    if (JOURNEY[i] !== "/" && href.startsWith(JOURNEY[i])) return i;
  }
  return -1;
}

// ─── Context ───────────────────────────────────────────────────────────────
// direction: -1 = backward, 0 = lateral/unknown, 1 = forward
type Ctx = {
  go: (href: string) => void;
  currentPath: { current: string };
  direction: number;
};

const TransitionCtx = createContext<Ctx>({
  go: () => {},
  currentPath: { current: "/" },
  direction: 0,
});

export const usePageTransition = () => useContext(TransitionCtx);

// ─── Flash overlay ─────────────────────────────────────────────────────────
// A radial accent bloom that fires at the midpoint of the transition,
// masking the React tree swap and giving the illusion of a seamless depth morph.
function FlashOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="flash"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(201,163,92,0.18) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.92) 100%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Track current path in a ref for synchronous reads inside go()
  const currentPath = useRef<string>(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  // direction is stored as React state so MainWrapper can read it reactively
  const [direction, setDirection] = useState<number>(0);

  // Flash overlay visibility
  const [flashVisible, setFlashVisible] = useState(false);

  const go = useCallback(
    (href: string) => {
      const fromIndex = journeyIndex(currentPath.current);
      const toIndex = journeyIndex(href);

      // Determine direction: -1 = backward, 0 = lateral/unknown, 1 = forward
      let dir = 0;
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        dir = toIndex > fromIndex ? 1 : -1;
      }

      // Commit direction to state — MainWrapper reads this as the `custom` prop
      // on the AnimatePresence variant so exit + enter both know the direction.
      setDirection(dir);

      // Trigger flash at midpoint: show it, then navigate, then hide it
      setFlashVisible(true);

      setTimeout(() => {
        currentPath.current = href;
        router.push(href);
      }, 160);

      setTimeout(() => {
        setFlashVisible(false);
      }, 380);
    },
    [router]
  );

  return (
    <TransitionCtx.Provider value={{ go, currentPath, direction }}>
      {children}
      <FlashOverlay visible={flashVisible} />
    </TransitionCtx.Provider>
  );
}

// ─── TransitionLink ────────────────────────────────────────────────────────
// Public API is unchanged: <TransitionLink href="...">...</TransitionLink>
type LinkProps = { href: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
>;

export function TransitionLink({ href, children, ...rest }: LinkProps) {
  const { go } = usePageTransition();
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        go(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
