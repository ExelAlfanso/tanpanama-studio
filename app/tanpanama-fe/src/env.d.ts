/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// biome-ignore lint/style/noNamespace: Cloudflare's Workers types use namespace merging for bindings.
declare namespace Cloudflare {
  interface Env {
    PUBLIC_API_URL?: string;
  }
}
