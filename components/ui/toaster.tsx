"use client";

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full max-w-[360px] flex-col-reverse gap-2 pointer-events-none p-4 sm:p-0">
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} onClose={() => dismiss(t.id)}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
        </Toast>
      ))}
    </div>
  );
}

