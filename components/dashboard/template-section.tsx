"use client";

import * as React from "react";
import { Plus, ChevronDown, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateItem {
  id: string;
  title: string;
  isCustomNew?: boolean;
  icon?: React.ReactNode;
  previewSnippet?: React.ReactNode;
}

const templates: TemplateItem[] = [
  {
    id: "blank",
    title: "Blank board",
    isCustomNew: true,
  },
  {
    id: "ai-playground",
    title: "AI Playground",
    previewSnippet: (
      <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
        <div className="flex items-center gap-1 rounded-md bg-violet-100 dark:bg-violet-950/60 px-2 py-1 text-[11px] font-medium text-violet-700 dark:text-violet-300">
          <Sparkles className="size-3" />
          <span>Sidekick AI</span>
        </div>
        <div className="flex gap-1 mt-1">
          <div className="size-3 rounded-full bg-blue-400/80 animate-pulse" />
          <div className="size-3 rounded-full bg-amber-400/80" />
          <div className="size-3 rounded-full bg-emerald-400/80" />
        </div>
      </div>
    ),
  },
  {
    id: "flowchart",
    title: "Flowchart",
    previewSnippet: (
      <div className="flex items-center justify-center gap-2 p-3">
        <div className="size-6 rounded-md bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <Workflow className="size-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="h-0.5 w-4 bg-muted-foreground/30" />
        <div className="size-5 rotate-45 rounded-xs bg-amber-500/20 border border-amber-500/40" />
        <div className="h-0.5 w-4 bg-muted-foreground/30" />
        <div className="size-6 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
      </div>
    ),
  },
];

export function TemplateSection() {
  return (
    <section className="w-full mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Start something new
          </h2>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5 transition-colors">
            <span>Templates for All roles</span>
            <ChevronDown className="size-3" />
          </button>
        </div>

        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold px-3"
        >
          <Plus className="size-3.5" />
          <span>Create</span>
        </Button>
      </div>

      {/* 3 Placeholders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id} className="group flex flex-col gap-2 cursor-pointer">
            <div
              className={`relative flex h-28 w-full items-center justify-center rounded-xl border transition-all duration-200 overflow-hidden ${
                tpl.isCustomNew
                  ? "border-dashed border-border hover:border-foreground/40 bg-muted/20 hover:bg-muted/40"
                  : "border-border/80 bg-muted/15 hover:bg-muted/30 hover:shadow-xs hover:border-border"
              }`}
            >
              {tpl.isCustomNew ? (
                <div className="flex size-10 items-center justify-center rounded-full bg-background/80 shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              ) : (
                tpl.previewSnippet
              )}
            </div>
            <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground">
              {tpl.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

