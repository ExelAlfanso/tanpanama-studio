import { betterAuth } from "better-auth";
import type { Env } from "../env";
import { isAllowedAdmin } from "./allow-admin";

export function createAuth(env: Env) {
  if (
    !(
      env.BETTER_AUTH_SECRET &&
      env.BETTER_AUTH_URL &&
      env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET
    )
  ) {
    throw new Error("Authentication configuration is incomplete.");
  }

  return betterAuth({
    basePath: "/api/auth",
    baseURL: env.BETTER_AUTH_URL,
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        requireEmailVerification: true,
      },
    },
    trustedOrigins: [env.PUBLIC_SITE_URL, env.ADMIN_SITE_URL],
    user: {
      validateUserInfo: ({ user, source }) => {
        if (
          source.oauth?.providerId === "google" &&
          !isAllowedAdmin(user.email, env.ADMIN_EMAILS)
        ) {
          return {
            error: "email_not_allowed",
            errorDescription:
              "This Google account is not on the studio admin list.",
          };
        }
      },
    },
  });
}
