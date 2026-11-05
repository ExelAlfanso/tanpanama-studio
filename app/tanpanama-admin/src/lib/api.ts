import type { AppType } from "@tanpanama/tanpanama-api/rpc";
import { hc } from "hono/client";

export const api = hc<AppType>(
  typeof window === "undefined"
    ? "http://localhost:3001"
    : window.location.origin,
  {
    init: { credentials: "include" },
  }
);
