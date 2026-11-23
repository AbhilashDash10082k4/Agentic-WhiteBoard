import * as React from "react";
import { SignUp } from "@clerk/nextjs";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";

const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export default function SignUpPage() {
  return (
    <AuthCardLayout mode="sign-up">
      {isClerkConfigured && (
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none p-0 border-0",
              headerTitle: "text-[#FFFAD3] text-2xl font-bold",
              headerSubtitle: "text-[#a4b3d6] text-xs",
              formButtonPrimary:
                "bg-[#22396F] hover:bg-[#0D1C42] text-[#FFFAD3] font-semibold text-sm shadow-md transition-all py-2.5 rounded-lg border border-[#22396F]",
              formFieldInput:
                "bg-[#010736] border-[#22396F]/60 text-[#FFFAD3] text-sm rounded-lg focus:border-[#F8E0A4]",
              formFieldLabel: "text-[#FFFAD3] text-xs font-medium",
              footerActionLink: "text-[#F8E0A4] hover:text-[#FFDBB0]",
              socialButtonsBlockButton:
                "border-[#22396F]/50 bg-[#010736] hover:bg-[#0D1C42] text-[#FFFAD3] text-xs rounded-lg",
              dividerLine: "bg-[#22396F]/30",
              dividerText: "text-[#a4b3d6] text-xs",
            },
          }}
        />
      )}
    </AuthCardLayout>
  );
}
