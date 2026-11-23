"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function HeroSection() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial gradient glow using oceanic navy and amber */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] bg-[#0D1C42]/25 dark:bg-[#22396F]/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 size-[400px] bg-[#F8E0A4]/15 dark:bg-[#010736]/40 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#22396F]/30 bg-[#22396F]/10 dark:border-[#F8E0A4]/30 dark:bg-[#F8E0A4]/10 px-3.5 py-1 text-xs font-semibold text-[#010736] dark:text-[#F8E0A4] mb-6 backdrop-blur-md">
          <Sparkles className="size-3.5 text-[#22396F] dark:text-[#F8E0A4]" />
          <span>Next-Gen Multi-Agent Canvas Architecture</span>
        </div>

        {/* Big Bold Headline clearly defining purpose */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.12]">
          Think, Visualise & Co-Create with{" "}
          <span className="bg-gradient-to-r from-[#22396F] via-[#0D1C42] to-[#1F150C] dark:from-[#F8E0A4] dark:via-[#FFDBB0] dark:to-[#FFFAD3] bg-clip-text text-transparent">
            Autonomous AI Agents
          </span>
        </h1>

        {/* Detailed Purpose Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The infinite collaborative whiteboard engineered for real-time human-agent collaboration.
          Draft system architectures, brainstorm concepts, snap magnetic connectors, and watch AI agents build living diagrams.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="h-12 px-7 bg-[#22396F] hover:bg-[#0D1C42] text-[#FFFAD3] dark:bg-[#F8E0A4] dark:hover:bg-[#FFDBB0] dark:text-[#010736] font-semibold text-base rounded-xl shadow-lg shadow-[#0D1C42]/20 gap-2"
            >
              <Zap className="size-4" />
              <span>Launch Whiteboard</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          <a href="#demo">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 rounded-xl border-border bg-background/80 hover:bg-muted font-medium text-base gap-2 backdrop-blur-xs"
            >
              <Play className="size-4 text-[#22396F] dark:text-[#F8E0A4] fill-current" />
              <span>Watch Video Demo</span>
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Miro-Grade Magnetic Connectors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Multi-Agent AI Sidekicks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-sky-500" />
            <span>KMS-Encrypted Credential Vault</span>
          </div>
        </div>

        {/* Video Placeholder Section */}
        <div id="demo" className="mt-16 sm:mt-20 scroll-mt-28">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/80 bg-neutral-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Mock Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#010736] border-b border-[#0D1C42]">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0D1C42] border border-[#22396F]/40 text-[11px] text-[#F8E0A4]">
                <Sparkles className="size-3 text-[#F8E0A4]" />
                <span>agentic-whiteboard.io/workspace/demo-architecture</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Video Player / Canvas Mockup */}
            <div className="relative aspect-video w-full bg-[#010736] flex items-center justify-center overflow-hidden group">
              {isPlaying ? (
                <div className="size-full flex flex-col items-center justify-center p-8 bg-[#010736] text-white animate-fadeIn">
                  <div className="size-16 rounded-full bg-[#0D1C42] border border-[#22396F] flex items-center justify-center mb-4 animate-bounce">
                    <Sparkles className="size-8 text-[#F8E0A4]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Functioning Demonstration Playing</h3>
                  <p className="text-sm text-neutral-300 max-w-md text-center">
                    Demonstrating magnetic connector auto-snapping, multi-agent diagram drafting, and real-time schema generation.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(false)}
                    className="mt-6 border-[#22396F] bg-[#0D1C42] text-[#FFFAD3] hover:bg-[#22396F]"
                  >
                    Reset Demo
                  </Button>
                </div>
              ) : (
                <>
                  {/* Simulated Canvas Background Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#22396F_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

                  {/* Simulated Diagrams & Connections */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="relative flex items-center gap-12 sm:gap-20">
                      {/* Left Node */}
                      <div className="px-5 py-3 rounded-xl border-2 border-emerald-500/80 bg-emerald-500/10 text-emerald-400 font-semibold text-xs sm:text-sm shadow-md">
                        Client Frontend
                      </div>

                      {/* Connecting Arrow */}
                      <div className="w-12 sm:w-24 h-0.5 bg-[#22396F] relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-l-[#F8E0A4] border-l-8 border-y-transparent border-y-4 border-r-0" />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-neutral-400 whitespace-nowrap font-mono">
                          REST / SSE
                        </span>
                      </div>

                      {/* Middle Node */}
                      <div className="px-5 py-3 rounded-xl border-2 border-[#22396F] bg-[#0D1C42] text-[#F8E0A4] font-semibold text-xs sm:text-sm shadow-lg ring-4 ring-[#22396F]/30 animate-pulse">
                        Autonomous Agent Hub
                      </div>

                      {/* Connecting Arrow */}
                      <div className="w-12 sm:w-24 h-0.5 bg-[#22396F] relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-l-[#F8E0A4] border-l-8 border-y-transparent border-y-4 border-r-0" />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-neutral-400 whitespace-nowrap font-mono">
                          Encrypted DEK
                        </span>
                      </div>

                      {/* Right Node */}
                      <div className="px-5 py-3 rounded-xl border-2 border-[#F8E0A4]/80 bg-[#FFDBB0]/15 text-[#F8E0A4] font-semibold text-xs sm:text-sm shadow-md">
                        PostgreSQL Vault
                      </div>
                    </div>
                  </div>

                  {/* Play Video Overlay Button */}
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="relative z-10 flex flex-col items-center gap-3 group/btn cursor-pointer"
                  >
                    <div className="size-16 sm:size-20 rounded-full bg-[#22396F] dark:bg-[#F8E0A4] group-hover/btn:scale-110 transition-all flex items-center justify-center shadow-2xl ring-8 ring-[#22396F]/30 dark:ring-[#F8E0A4]/30">
                      <Play className="size-7 sm:size-8 text-[#FFFAD3] dark:text-[#010736] fill-current ml-1" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white tracking-wide bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                      Click to Play App Video Walkthrough
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
