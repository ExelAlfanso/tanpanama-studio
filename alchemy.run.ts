// biome-ignore lint/performance/noNamespaceImport: Alchemy resources are grouped under Cloudflare service namespaces.
import * as Cloudflare from "@alchemy.run/cloudflare";
// biome-ignore lint/performance/noNamespaceImport: Alchemy's stack API is exposed as a namespace.
import * as Alchemy from "alchemy";
// biome-ignore lint/performance/noNamespaceImport: Effect's Config API is namespaced by the package.
import * as Config from "effect/Config";
// biome-ignore lint/performance/noNamespaceImport: Effect's generator API is namespaced by the package.
import * as Effect from "effect/Effect";

export const ContentDb = Cloudflare.D1.Database("tanpanama-content", {
  migrations: "./app/tanpanama-api/migrations",
});

export const CmsImages = Cloudflare.R2.Bucket("tanpanama-cms-images");

export const Api = Cloudflare.Worker("tanpanama-api", {
  compatibility: { date: "2026-11-05" },
  env: {
    ADMIN_EMAILS: Config.String("ADMIN_EMAILS"),
    ADMIN_SITE_URL: Config.String("ADMIN_SITE_URL"),
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: Config.String("BETTER_AUTH_URL"),
    DB: ContentDb,
    GOOGLE_CLIENT_ID: Config.String("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: Config.Redacted("GOOGLE_CLIENT_SECRET"),
    IMAGES: CmsImages,
    PUBLIC_SITE_URL: Config.String("PUBLIC_SITE_URL"),
  },
  main: "./app/tanpanama-api/src/index.ts",
});

export type ApiEnv = Cloudflare.InferEnv<typeof Api>;
export interface AdminEnv {
  API_URL: string;
}

export default Alchemy.Stack(
  "tanpanama-studio",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const database = yield* ContentDb;
    const imageBucket = yield* CmsImages;
    const api = yield* Api;
    const website = yield* Cloudflare.Website.Astro("tanpanama-fe", {
      domain: "tanpanama.alfanso.xyz",
      env: { PUBLIC_API_URL: api.url.as<string>() },
      rootDir: "./app/tanpanama-fe",
    });
    const admin = yield* Cloudflare.Website.Vite("tanpanama-admin", {
      dev: { port: 3001 },
      domain: "admin.tanpanama.alfanso.xyz",
      env: { API_URL: api.url.as<string>() },
      rootDir: "./app/tanpanama-admin",
    });
    return {
      adminUrl: admin.url,
      apiUrl: api.url,
      databaseName: database.databaseName,
      imageBucketName: imageBucket.bucketName,
      websiteUrl: website.url,
    };
  })
);
