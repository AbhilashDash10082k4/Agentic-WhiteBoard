import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import Provider from "./provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Agentic Whiteboard",
  description: "Collaborative whiteboard and workspace platform.",
};

const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Provider>
        {children}
        <Toaster />
      </Provider>
    </ThemeProvider>
  );

  if (!isClerkConfigured) {
    return (
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("font-sans", geist.variable)}
      >
        <body className="m-0 p-0 antialiased bg-background text-foreground">
          {content}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("font-sans", geist.variable)}
      >
        <body className="m-0 p-0 antialiased bg-background text-foreground">
          {content}
        </body>
      </html>
    </ClerkProvider>
  );
}
