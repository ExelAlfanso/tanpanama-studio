import { createFileRoute } from "@tanstack/react-router";
import { env } from "../env";

function proxy({
  request,
  params,
}: {
  request: Request;
  params: { _splat: string };
}) {
  if (!env.API_URL) {
    return new Response("API upstream is not configured.", { status: 503 });
  }
  const incoming = new URL(request.url);
  const upstream = new URL(
    `/api/${params._splat}${incoming.search}`,
    env.API_URL
  );
  return fetch(new Request(upstream, request));
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      DELETE: proxy,
      GET: proxy,
      OPTIONS: proxy,
      PATCH: proxy,
      POST: proxy,
      PUT: proxy,
    },
  },
});
