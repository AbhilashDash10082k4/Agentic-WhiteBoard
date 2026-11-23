"use client";

import * as React from "react";
import Link from "next/link";
import { AppLogo } from "./app-logo";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-xs py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo size={34} className="transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
            Agentic <span className="text-[#22396F] dark:text-[#F8E0A4]">Whiteboard</span>
          </span>
        </Link>

        {/* Navigation Anchors with Smooth Scroll */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#demo"
            className="hover:text-foreground transition-colors"
          >
            Video Demo
          </a>
          <a
            href="#workflows"
            className="hover:text-foreground transition-colors"
          >
            Workflows
          </a>
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Workspace
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Link href="/sign-in" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="font-medium text-sm">
              Sign In
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              size="sm"
              className="bg-[#22396F] hover:bg-[#0D1C42] text-white dark:bg-[#F8E0A4] dark:hover:bg-[#FFDBB0] dark:text-[#010736] font-semibold text-sm rounded-lg shadow-sm gap-1.5 px-4"
            >
              <Sparkles className="size-3.5" />
              <span>Get Started</span>
              <ArrowRight className="size-3.5 hidden sm:inline" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
