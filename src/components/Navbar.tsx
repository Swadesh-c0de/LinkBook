"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { User, LayoutDashboard, Github, ExternalLink, Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  const navLinks = isAuthenticated
    ? [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Profile", href: "/profile", icon: User },
    ]
    : [
      { name: "Log In", href: "/login", icon: User },
    ];

  return (
    <>
      <div className={`fixed top-0 inset-x-0 h-0.5 bg-foreground z-[100] transition-transform duration-1000 origin-left ${navigating ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />

      <motion.header
        className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        initial={{ opacity: 0, y: -16 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -100,
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.nav
          className={`relative flex items-center justify-between pointer-events-auto overflow-visible rounded-[2rem] glass transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${scrolled
            ? "w-[calc(100%-2rem)] max-w-2xl h-11 sm:h-12 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-foreground/5 bg-background/80"
            : "w-full max-w-4xl h-16 sm:h-18 px-6 sm:px-8 shadow-none"
            }`}
        >
          <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => setNavigating(true)}>
            <div className="relative flex flex-row items-center">
              <span className={`font-cursive font-bold -ml-0.5 text-primary/90 leading-none transition-all duration-500 ${scrolled ? "text-2xl sm:text-3xl" : "text-2xl sm:text-3xl"}`}>Kontacts</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setNavigating(true)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] ${isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-glow"
                      className="absolute inset-0 rounded-2xl bg-primary/10 -z-10 blur-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="mx-3 h-6 w-px bg-border/40 transition-colors duration-500" />

            <div className="rounded-none transition-all duration-300 text-muted-foreground p-1 active:scale-95 cursor-pointer">
              <ThemeToggle />
            </div>

            {/* GitHub Dropdown Menu */}
            <div className="relative group ml-1">
              <a
                href="https://github.com/Swadesh-c0de/kontacts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] border border-border/40 hover:border-border/80"
                title="GitHub Repositories"
              >
                <Github className="h-4 w-4" />
                <span className="hidden lg:inline text-xs font-bold">GitHub</span>
              </a>

              {/* Hover Dropdown showing Frontend and Backend Repos */}
              <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="w-56 p-2 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Source Repositories
                  </div>
                  <a
                    href="https://github.com/Swadesh-c0de/kontacts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Frontend Repo</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                  <a
                    href="https://github.com/Swadesh-c0de/contacts-management-system-backend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Backend Repo</span>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center group active:scale-95 transition-transform duration-200">
            <ThemeToggle />
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Bottom Nav */}
      <motion.div
        className="md:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none will-change-transform"
        style={{ transform: "translateZ(0)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
      >
        <div className={`flex items-center justify-around w-full max-w-sm p-1.5 transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] pointer-events-auto rounded-[2rem] bg-background/95 border border-border/40 shadow-md ${scrolled ? "ring-1 ring-foreground/5" : ""}`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setNavigating(true)}
                className={`group flex flex-col items-center justify-center flex-1 py-2 rounded-[1.5rem] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-90 ${isActive
                  ? "bg-foreground text-background shadow-md shadow-foreground/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5`} />
                <span className="text-[10px] sm:text-xs font-bold tracking-tight mt-0.5 transition-opacity duration-300">{link.name}</span>
              </Link>
            );
          })}

          <a
            href="https://github.com/Swadesh-c0de/kontacts"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center flex-1 py-2 rounded-[1.5rem] text-muted-foreground hover:text-foreground active:scale-90 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
            title="GitHub Repository"
          >
            <Github className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span className="text-[10px] sm:text-xs font-bold tracking-tight mt-0.5">GitHub</span>
          </a>
        </div>
      </motion.div>
    </>
  );
}
