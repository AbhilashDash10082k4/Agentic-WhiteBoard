import * as React from "react";
import Link from "next/link";
import { AppLogo } from "./app-logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          <span className="text-sm font-bold text-foreground">
            Agentic Whiteboard
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-foreground transition-colors">
            Demo
          </a>
          <Link href="/sign-in" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="hover:text-foreground transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
