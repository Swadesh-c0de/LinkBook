"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = isDark ? "light" : "dark";

    // Fallback for browsers without View Transitions or users with reduced motion
    if (
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    const buttonElement = e.currentTarget;
    const rect = buttonElement.getBoundingClientRect();
    
    // Always expand from the center of the toggle button for consistent symmetry
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Tactile button bounce
    buttonElement.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.88)" },
        { transform: "scale(1.08)" },
        { transform: "scale(1)" },
      ],
      { duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );

    try {
      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });

      transition.ready
        .then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ];

          document.documentElement.animate(
            {
              clipPath: clipPath,
            },
            {
              duration: 750,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {
          // Gracefully catch if transition was skipped or aborted
        });
    } catch {
      // Fallback if startViewTransition throws synchronously
      setTheme(newTheme);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`group relative h-10 w-10 flex items-center justify-center transition-all duration-300 active:scale-95 z-[9999] rounded-full`}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5 flex items-center justify-center pointer-events-none z-10">
        <Sun
          className={`absolute h-full w-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-current"
            }`}
        />
        <Moon
          className={`absolute h-full w-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDark
            ? "rotate-0 scale-100 opacity-100 text-current"
            : "-rotate-90 scale-0 opacity-0"
            }`}
        />
      </div>

      <div
        id="theme-shockwave"
        className="absolute pointer-events-none rounded-full border border-foreground/10 opacity-0 scale-0 z-0"
        style={{ width: '40px', height: '40px' }}
      />
    </button>
  );
}
