"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Star, FolderOpen, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSidebar({ isOpen, onClose }: WorkspaceSidebarProps) {
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName || "User";

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop on mobile / click away */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating or docked sidebar panel matching Miro */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-border bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-200 ease-in-out">
        {/* Top Header & Navigation */}
        <div className="flex flex-col p-4 gap-5">
          {/* Brand & Action */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 font-extrabold text-lg tracking-tight text-foreground select-none hover:opacity-85 transition-opacity"
            >
              <span>Agentic WhiteBoard</span>
              <span className="text-amber-400 text-base leading-none">✱</span>
            </Link>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                className="size-7 rounded-md border-border bg-background hover:bg-muted"
                title="Create workspace"
              >
                <Plus className="size-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-7 text-muted-foreground hover:text-foreground md:hidden"
                onClick={onClose}
                title="Close sidebar"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
            >
              <Home className="size-4" />
              <span>Home</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-left"
            >
              <Star className="size-4" />
              <span>Starred</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-left"
            >
              <FolderOpen className="size-4" />
              <span>Browse</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-left"
            >
              <Search className="size-4" />
              <span>Search</span>
            </button>
          </nav>

          {/* Spaces Section */}
          <div className="flex flex-col gap-1.5 border-t border-border/60 pt-4">
            <span className="text-xs font-semibold text-foreground/90">
              Spaces
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create a Space to group Boards or Docs together in a shared place
              for your team or project.
            </p>
          </div>
        </div>

        {/* Bottom Team / Account Switcher */}
        <div className="flex flex-col gap-2 border-t border-border/60 p-4">
          <div className="flex items-center gap-2.5 cursor-pointer rounded-lg p-1 hover:bg-muted transition-colors">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-xs font-medium text-foreground">
              {userName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 cursor-pointer rounded-lg p-1 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-400 text-xs font-bold text-neutral-900 shadow-xs">
                AT
              </div>
              <span className="truncate text-xs font-medium text-foreground">
                {userName} Team
              </span>
            </div>
            <Button
              variant="outline"
              size="icon-xs"
              className="size-6 rounded-md border-border bg-background hover:bg-muted shrink-0"
              title="Add team"
            >
              <Plus className="size-3 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
