import * as React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ScrollFeatures } from "@/components/landing/scroll-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#F8E0A4]/40 selection:text-[#010736]">
        {/* Sticky Glass Navbar */}
        <LandingNavbar />

        {/* Hero Section with Video Demo Placeholder */}
        <HeroSection />

        {/* Progressive Scroll Feature Cards */}
        <ScrollFeatures />

        {/* Footer */}
        <LandingFooter />
      </main>
    </SmoothScrollProvider>
  );
}
