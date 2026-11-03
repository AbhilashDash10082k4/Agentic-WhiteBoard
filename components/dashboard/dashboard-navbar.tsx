"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Users,
  Gift,
  Bell,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-md">
      {/* Brand & Organization section */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        <div className="flex items-center gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight text-foreground select-none">
            <span>miro</span>
            <span className="text-amber-400 text-base leading-none">✱</span>
          </div>

          {/* Beta Tag */}
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] font-semibold text-muted-foreground bg-muted"
          >
            Beta
          </Badge>

          {/* Plan Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
              >
                <span>Free plan</span>
                <ChevronDown className="size-3" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem className="text-xs">
                Free plan (Active)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-blue-600 dark:text-blue-400">
                <Sparkles className="size-3 mr-1.5" />
                Upgrade to Starter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Invite Members */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs font-medium border-border hover:bg-muted"
        >
          <Users className="size-3.5 text-muted-foreground" />
          <span>Invite members</span>
        </Button>

        {/* Upgrade Button */}
        <Button
          size="sm"
          className="h-8 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          Upgrade
        </Button>

        {/* What's New / Rewards */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-foreground"
          title="What's new"
        >
          <Gift className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-foreground"
          title="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* User Profile via Clerk */}
        <div className="ml-1 flex items-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-8 ring-1 ring-border shadow-xs",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

