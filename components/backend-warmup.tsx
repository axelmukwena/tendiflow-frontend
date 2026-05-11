"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

/**
 * Fire-and-forget warmup ping to the backend on initial mount and on every
 * route change.
 *
 * The backend runs on Cloud Run with min-instances=0; without this, a user's
 * first real API call eats the cold-start latency. Re-pinging on each
 * navigation also keeps the container warm during long sessions where it
 * might otherwise scale back to zero between clicks.
 */
export const BackendWarmup = (): null => {
  const pathname = usePathname();

  useEffect(() => {
    void fetch(
      `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}/api/v1/healthcheck`,
      { method: "GET", cache: "no-store" },
    ).catch(() => {
      // Warmup failures are non-fatal.
    });
  }, [pathname]);

  return null;
};
