"use client";

import * as React from "react";

export type ToastType = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

type State = {
  toasts: ToastType[];
};

let memoryState: State = { toasts: [] };
const listeners: Array<(state: State) => void> = [];

function dispatch(action: { type: "ADD_TOAST"; toast: ToastType } | { type: "DISMISS_TOAST"; toastId: string }) {
  if (action.type === "ADD_TOAST") {
    memoryState = {
      ...memoryState,
      toasts: [action.toast, ...memoryState.toasts].slice(0, 3),
    };
  } else if (action.type === "DISMISS_TOAST") {
    memoryState = {
      ...memoryState,
      toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
    };
  }

  listeners.forEach((listener) => listener(memoryState));
}

export function toast({
  title,
  description,
  variant = "default",
  duration = 3000,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}) {
  const id = crypto.randomUUID();

  dispatch({
    type: "ADD_TOAST",
    toast: { id, title, description, variant },
  });

  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  }, duration);

  return id;
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

