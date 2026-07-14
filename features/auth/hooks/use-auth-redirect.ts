"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Sends the user back to where they came from after signing in. */
export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return () => {
    const from = searchParams.get("from");
    router.push(from && from.startsWith("/") ? from : "/dashboard");
    router.refresh();
  };
}
