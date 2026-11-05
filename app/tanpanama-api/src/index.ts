import { zValidator } from "@hono/zod-validator";
import { projectInputSchema } from "@tanpanama/contracts";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { isAllowedAdmin } from "./auth/allow-admin";
import { projects } from "./db/schema";
import type { Env } from "./env";

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const maxImageSize = 5 * 1024 * 1024;
const imageKeyPattern = /^[\da-f-]{36}\.(?:jpg|png|webp)$/;

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte
    );
  }
  return (
    file.type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

const routes = new Hono<{ Bindings: Env }>()
  .basePath("/api")
  .use(
    "*",
    cors({
      credentials: true,
      origin: (origin, c) =>
        [c.env.PUBLIC_SITE_URL, c.env.ADMIN_SITE_URL].includes(origin)
          ? origin
          : "",
    })
  )
  .get("/health", (c) => c.json({ ok: true }))
  .on(["GET", "POST"], "/auth/*", (c) => createAuth(c.env).handler(c.req.raw))
  .get("/projects", async (c) => {
    const db = drizzle(c.env.DB, { schema: { projects } });
    const entries = await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.sortOrder));
    return c.json(entries);
  })
  .get("/media/:key", async (c) => {
    const key = c.req.param("key");
    if (!imageKeyPattern.test(key)) {
      return c.notFound();
    }
    const object = await c.env.IMAGES.get(key);
    if (!object) {
      return c.notFound();
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  })
  .use("/admin/*", async (c, next) => {
    const auth = createAuth(c.env);
    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    if (
      !(
        result?.session && isAllowedAdmin(result.user.email, c.env.ADMIN_EMAILS)
      )
    ) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  })
  .post("/admin/media", async (c) => {
    const { file } = await c.req.parseBody();
    if (!(file instanceof File)) {
      return c.json({ error: "Choose an image to upload." }, 400);
    }

    const extension =
      imageExtensions[file.type as keyof typeof imageExtensions];
    if (
      !extension ||
      file.size < 1 ||
      file.size > maxImageSize ||
      !(await hasValidImageSignature(file))
    ) {
      return c.json(
        { error: "Use a valid JPEG, PNG, or WebP image up to 5 MB." },
        400
      );
    }

    const key = `${crypto.randomUUID()}.${extension}`;
    await c.env.IMAGES.put(key, file.stream(), {
      httpMetadata: {
        cacheControl: "public, max-age=31536000, immutable",
        contentType: file.type,
      },
    });
    return c.json(
      { url: new URL(`/api/media/${key}`, c.req.url).toString() },
      201
    );
  })
  .get("/admin/projects", async (c) => {
    const db = drizzle(c.env.DB, { schema: { projects } });
    return c.json(
      await db.select().from(projects).orderBy(asc(projects.sortOrder))
    );
  })
  .post(
    "/admin/projects",
    zValidator("json", projectInputSchema),
    async (c) => {
      const db = drizzle(c.env.DB, { schema: { projects } });
      const [created] = await db
        .insert(projects)
        .values({ id: crypto.randomUUID(), ...c.req.valid("json") })
        .returning();
      return c.json(created, 201);
    }
  )
  .put(
    "/admin/projects/:id",
    zValidator("json", projectInputSchema),
    async (c) => {
      const db = drizzle(c.env.DB, { schema: { projects } });
      const [updated] = await db
        .update(projects)
        .set(c.req.valid("json"))
        .where(eq(projects.id, c.req.param("id")))
        .returning();
      return updated
        ? c.json(updated)
        : c.json({ error: "Project not found" }, 404);
    }
  )
  .delete("/admin/projects/:id", async (c) => {
    const db = drizzle(c.env.DB, { schema: { projects } });
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, c.req.param("id")))
      .returning();
    return deleted
      ? c.json({ deleted: true })
      : c.json({ error: "Project not found" }, 404);
  });

export type AppType = typeof routes;
export default routes;
