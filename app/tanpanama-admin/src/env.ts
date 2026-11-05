// biome-ignore lint/performance/noNamespaceImport: Alchemy provides runtime bindings as a dynamic env object.
import * as cloudflare from "cloudflare:workers";
import type { AdminEnv } from "../../../alchemy.run";

export const env = new Proxy({} as AdminEnv, {
  get(_, property: string) {
    if (property === "API_URL" && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return cloudflare.env[property as keyof typeof cloudflare.env];
  },
});
