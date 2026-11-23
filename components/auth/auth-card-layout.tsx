"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { AppLogo } from "@/components/landing/app-logo";

interface AuthCardLayoutProps {
  mode: "sign-in" | "sign-up";
  children?: React.ReactNode;
}

export function AuthCardLayout({ mode, children }: AuthCardLayoutProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreed, setAgreed] = React.useState(true);
  const [activeSlide, setActiveSlide] = React.useState(2);

  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen w-full bg-[#010736] text-[#FFFAD3] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#F8E0A4]/30 selection:text-[#010736]">
      {/* Outer Shell Container */}
      <div className="w-full max-w-6xl min-h-[720px] rounded-3xl bg-[#0D1C42] border border-[#22396F]/40 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Dune Card (approx 45%) */}
        <div className="lg:col-span-5 relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0D1C42] via-[#010736] to-[#1F150C] m-2.5 rounded-2xl border border-[#22396F]/50">
          {/* Dune Background SVG Graphic Art */}
          <div className="absolute inset-0 pointer-events-none opacity-90">
            <svg
              className="absolute bottom-0 left-0 w-full h-[70%]"
              viewBox="0 0 500 500"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="dune-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22396F" />
                  <stop offset="100%" stopColor="#010736" />
                </linearGradient>
                <linearGradient id="dune-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D1C42" />
                  <stop offset="100%" stopColor="#1F150C" />
                </linearGradient>
                <linearGradient id="sky-glow" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#22396F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="500" height="500" fill="url(#sky-glow)" />
              {/* Back Dune */}
              <path
                d="M0,320 Q180,240 320,290 T500,240 L500,500 L0,500 Z"
                fill="url(#dune-1)"
              />
              {/* Foreground Sharp Dune Ridge */}
              <path
                d="M0,390 Q220,280 340,350 T500,320 L500,500 L0,500 Z"
                fill="url(#dune-2)"
              />
              {/* Fine Ridge Golden Accent Highlight */}
              <path
                d="M0,390 Q220,280 340,350 T500,320"
                stroke="#F8E0A4"
                strokeWidth="1.2"
                strokeOpacity="0.7"
              />
            </svg>
          </div>

          {/* Top Left Header & Back Link */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <AppLogo size={32} />
              <span className="font-extrabold tracking-wider text-sm text-[#FFFAD3]">
                AW
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#010736]/60 hover:bg-[#010736]/90 border border-[#22396F]/50 text-xs font-medium text-[#FFFAD3] backdrop-blur-md transition-all"
            >
              <span>Back to website</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Bottom Card Title & Carousel Dots */}
          <div className="relative z-10 mt-44 sm:mt-60">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FFFAD3] leading-tight max-w-xs">
              Capturing Moments, Creating Memories
            </h2>

            {/* Pagination Line Dots */}
            <div className="mt-8 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeSlide === i
                      ? "w-8 bg-[#F8E0A4]"
                      : "w-4 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Card (approx 55%) */}
        <div className="lg:col-span-7 p-6 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Title & Switch Auth Route */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFAD3]">
              {isSignUp ? "Create an account" : "Sign in to account"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#a4b3d6]">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-[#F8E0A4] hover:text-[#FFDBB0] font-medium underline-offset-4 hover:underline"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-[#F8E0A4] hover:text-[#FFDBB0] font-medium underline-offset-4 hover:underline"
                  >
                    Create account
                  </Link>
                </>
              )}
            </p>

            {/* If Clerk children provided, render seamlessly styled */}
            {children ? (
              <div className="mt-8">{children}</div>
            ) : (
              /* Standalone form matching palette */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = "/dashboard";
                }}
                className="mt-8 space-y-4"
              >
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      defaultValue="Fletcher"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#010736] border border-[#22396F]/60 text-[#FFFAD3] text-xs sm:text-sm placeholder:text-[#a4b3d6]/60 focus:outline-none focus:border-[#F8E0A4] focus:ring-1 focus:ring-[#F8E0A4] transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#010736] border border-[#22396F]/60 text-[#FFFAD3] text-xs sm:text-sm placeholder:text-[#a4b3d6]/60 focus:outline-none focus:border-[#F8E0A4] focus:ring-1 focus:ring-[#F8E0A4] transition-all"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#010736] border border-[#22396F]/60 text-[#FFFAD3] text-xs sm:text-sm placeholder:text-[#a4b3d6]/60 focus:outline-none focus:border-[#F8E0A4] focus:ring-1 focus:ring-[#F8E0A4] transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#010736] border border-[#22396F]/60 text-[#FFFAD3] text-xs sm:text-sm placeholder:text-[#a4b3d6]/60 focus:outline-none focus:border-[#F8E0A4] focus:ring-1 focus:ring-[#F8E0A4] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a4b3d6] hover:text-[#FFFAD3]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {isSignUp && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAgreed(!agreed)}
                      className={`size-4 rounded flex items-center justify-center border transition-all ${
                        agreed
                          ? "bg-[#22396F] border-[#F8E0A4] text-[#F8E0A4]"
                          : "border-[#22396F] bg-[#010736]"
                      }`}
                    >
                      {agreed && <Check className="size-3" />}
                    </button>
                    <span className="text-xs text-[#a4b3d6] select-none">
                      I agree to the{" "}
                      <span className="underline underline-offset-2 text-[#FFFAD3]">
                        Terms & Conditions
                      </span>
                    </span>
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-lg bg-[#22396F] hover:bg-[#0D1C42] text-[#FFFAD3] border border-[#22396F] font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  {isSignUp ? "Create account" : "Sign in"}
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#22396F]/30" />
                  </div>
                  <span className="relative px-3 bg-[#0D1C42] text-[11px] text-[#a4b3d6] tracking-wider">
                    {isSignUp ? "Or register with" : "Or continue with"}
                  </span>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/dashboard")}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#22396F]/50 bg-[#010736] hover:bg-[#0D1C42] text-xs font-medium text-[#FFFAD3] transition-all cursor-pointer"
                  >
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.2.01 10.04.01 12s.45 3.8 1.25 5.41l4.02-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (window.location.href = "/dashboard")}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#22396F]/50 bg-[#010736] hover:bg-[#0D1C42] text-xs font-medium text-[#FFFAD3] transition-all cursor-pointer"
                  >
                    <svg className="size-4 fill-current text-[#FFFAD3]" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.04-.5 2.66-1.25z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
