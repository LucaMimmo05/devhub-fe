import { useEffect, useState } from "react";
import { useBackendWakeup } from "@/hooks/useBackendWakeup";

export function BackendWakeupBanner() {
  const status = useBackendWakeup();
  const [showBanner, setShowBanner] = useState(false);

  // Mostra il banner solo se dopo 2s il backend non ha ancora risposto
  useEffect(() => {
    if (status !== "checking") return;
    const timer = setTimeout(() => setShowBanner(true), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "awake" || (!showBanner && status === "checking")) return null;

  if (status === "error") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-sm text-center py-2 px-4">
        ⚠️ Il backend non risponde. Riprova tra qualche istante.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm gap-4">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="text-lg font-semibold">Backend in avvio...</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Il server si è messo in sleep dopo un periodo di inattività. Si
          sveglierà in circa 30–60 secondi.
        </p>
      </div>
    </div>
  );
}
