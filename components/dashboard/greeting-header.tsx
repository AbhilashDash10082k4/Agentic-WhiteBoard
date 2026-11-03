"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";

// Computes dynamic time-of-day greeting (morning, afternoon, evening)
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader() {
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = React.useState("Good evening");

  React.useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  const displayName = isLoaded
    ? user?.firstName || user?.fullName?.split(" ")[0] || "Friend"
    : "Friend";

  return (
    <section className="flex flex-col items-center justify-center pt-8 pb-6 text-center select-none">
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground transition-all">
        {greeting}, {displayName}
      </h1>
    </section>
  );
}

