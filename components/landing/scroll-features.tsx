"use client";

import * as React from "react";
import { Magnet, Bot, Lock, Layers, Zap, Cpu } from "lucide-react";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  index: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  gradient,
  index,
}: FeatureCardProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        transitionDelay: `${index * 120}ms`,
      }}
      className={`relative rounded-2xl border border-border/80 bg-card p-7 shadow-xs hover:shadow-lg transition-all duration-700 transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95"
      }`}
    >
      {/* Top accent badge */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`size-12 rounded-xl flex items-center justify-center ${gradient} shadow-xs`}
        >
          <Icon className="size-6 text-white" />
        </div>
        <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          {badge}
        </span>
      </div>

      <h3 className="text-xl font-bold text-card-foreground tracking-tight mb-2.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function ScrollFeatures() {
  const features = [
    {
      icon: Magnet,
      title: "Miro-Grade Magnetic Connectors",
      description:
        "Drag from shape boundary handles to instantly snap arrows or click to spawn symmetrically bound text nodes without manual alignment.",
      badge: "Canvas Gestures",
      gradient: "bg-gradient-to-tr from-[#0D1C42] to-[#22396F]",
    },
    {
      icon: Bot,
      title: "Autonomous Multi-Agent Co-Pilot",
      description:
        "Switch between System Architect, Database Engineer, and Code Reviewer. Generate live Excalidraw architecture elements via natural language.",
      badge: "Multi-Agent AI",
      gradient: "bg-gradient-to-tr from-[#22396F] to-[#010736]",
    },
    {
      icon: Lock,
      title: "KMS-Secured AI Credential Vault",
      description:
        "Envelope encryption with AES-256-GCM and AWS KMS. Protect API credentials with zero-knowledge plaintext isolation.",
      badge: "Enterprise Security",
      gradient: "bg-gradient-to-tr from-[#0D1C42] to-[#1F150C]",
    },
    {
      icon: Layers,
      title: "Auto-Healing Database Layer",
      description:
        "PostgreSQL schema with Drizzle ORM self-healing migrations. Organize boards, star favorites, and instantly restore canvas versions.",
      badge: "Persistence Engine",
      gradient: "bg-gradient-to-tr from-[#22396F] to-[#0D1C42]",
    },
    {
      icon: Zap,
      title: "Zero-Latency Autosave",
      description:
        "Optimistic UI state with background throttled syncing. Never lose a stroke, connector binding, or generated node during brainstorms.",
      badge: "State Synchronization",
      gradient: "bg-gradient-to-tr from-[#010736] to-[#22396F]",
    },
    {
      icon: Cpu,
      title: "Native Markdown & Canvas Duality",
      description:
        "Switch seamlessly between Excalidraw whiteboard and Markdown documentation within the same project workspace.",
      badge: "Dual Modality",
      gradient: "bg-gradient-to-tr from-[#1F150C] to-[#22396F]",
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/20 border-t border-border/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-[#22396F] dark:text-[#F8E0A4] uppercase mb-3">
            Engineered For Speed & Scale
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything You Need to Brainstorm, Architect, and Execute
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Built from first principles following strict SOLID architecture and sub-300-line modular design.
          </p>
        </div>

        {/* Responsive Grid with Progressive Scroll Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <FeatureCard
              key={f.title}
              index={i}
              icon={f.icon}
              title={f.title}
              description={f.description}
              badge={f.badge}
              gradient={f.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
