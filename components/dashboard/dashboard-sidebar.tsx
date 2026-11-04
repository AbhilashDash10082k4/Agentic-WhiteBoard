"use client";

import * as React from "react";
import {
  Home,
  Star,
  Search,
  Plus,
  FolderPlus,
  ChevronDown,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedUpgradeButton } from "@/components/dashboard/animated-upgrade-button";

// Navigation menu items
const navItems = [
  { title: "Home", icon: Home },
  { title: "Starred", icon: Star },
  { title: "Shared", icon: Users },
  { title: "AI Helper", icon: Sparkles },
  { title: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  boardsUsed?: number;
  totalBoards?: number;
}

export function DashboardSidebar({
  boardsUsed = 3,
  totalBoards = 5,
}: DashboardSidebarProps) {
  const [activeItem, setActiveItem] = React.useState("Home");

  // Calculate percentage used for progress bar
  const usagePercentage = Math.min(
    100,
    Math.round((boardsUsed / totalBoards) * 100)
  );

  return (
    <Sidebar className="border-r border-border bg-sidebar" collapsible="icon">
      {/* Workspace Header */}
      <SidebarHeader className="p-3 pb-2 gap-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:gap-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none">
            {/* Workspace Avatar */}
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f8b4a0] dark:bg-[#d97757] text-xs font-bold text-neutral-900 select-none shadow-xs"
              title="nil"
            >
              NI
            </div>

            {/* Workspace Name & Chevron - hidden when collapsed */}
            <div className="flex items-center gap-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                nil
              </span>
              <ChevronDown className="size-3 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* New Workspace Button - hidden when collapsed */}
          <Button
            variant="outline"
            size="icon-xs"
            className="size-7 rounded-md border-border bg-background hover:bg-muted shrink-0 group-data-[collapsible=icon]:hidden"
            title="Create new workspace"
          >
            <Plus className="size-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Search Bar (Expanded state) */}
        <div className="flex items-center gap-1.5 pt-1 group-data-[collapsible=icon]:hidden">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or to..."
              className="h-8 pl-8 text-xs bg-muted/40 dark:bg-neutral-900 border-border rounded-lg placeholder:text-muted-foreground focus-visible:ring-1"
            />
          </div>
          <Button
            variant="outline"
            size="icon-xs"
            className="size-8 rounded-lg border-border bg-background hover:bg-muted shrink-0"
            title="Quick add"
          >
            <Plus className="size-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Search Icon Button (Collapsed icon state) */}
        <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center pt-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 text-muted-foreground hover:text-foreground"
            title="Search"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 pt-2 gap-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-1">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeItem === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isSelected}
                      tooltip={item.title}
                      onClick={() => setActiveItem(item.title)}
                      className={`h-9 px-3 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-neutral-200/70 dark:bg-neutral-800 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spaces Section - hidden completely in icon collapsed mode */}
        <SidebarGroup className="p-0 pt-2 border-t border-border/60 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between px-2 pb-1.5">
            <SidebarGroupLabel className="p-0 text-xs font-semibold text-foreground/80 tracking-normal h-auto">
              Spaces
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-6 text-muted-foreground hover:text-foreground"
              title="Add space"
            >
              <FolderPlus className="size-3.5" />
            </Button>
          </div>
          <div className="px-2 py-1 text-xs text-muted-foreground leading-relaxed">
            Create a Space to group Boards or Docs together in a shared place
            for your team or project.
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with Free Plan Progress & Animated Upgrade Button */}
      <SidebarFooter className="p-3 pt-2 border-t border-border/60 group-data-[collapsible=icon]:p-1.5">
        <div className="flex flex-col gap-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/60 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          {/* Plan Usage Header & Progress Bar */}
          <div className="flex flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground font-semibold">Free plan</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {boardsUsed} / {totalBoards} boards
              </span>
            </div>

            {/* Golden Gradient Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {/* Animated Upgrade Button (Expanded) */}
          <div className="group-data-[collapsible=icon]:hidden">
            <AnimatedUpgradeButton size="full" showIcon>
              Upgrade plan
            </AnimatedUpgradeButton>
          </div>

          {/* Animated Upgrade Button (Collapsed Icon) */}
          <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <AnimatedUpgradeButton
              size="sm"
              className="size-8 p-0"
              title="Upgrade plan"
            >
              <Sparkles className="size-3.5 text-amber-500" />
            </AnimatedUpgradeButton>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
