import { useEffect, useState } from "react";
import { API_URL } from "@/services";

type Status = "checking" | "awake" | "error";

export function useBackendWakeup() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        // Usa un endpoint pubblico che risponde senza auth
        await fetch(`${API_URL}/auth/login`, {
          method: "HEAD",
          signal: AbortSignal.timeout(90_000),
        });
        if (!cancelled) setStatus("awake");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    ping();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
