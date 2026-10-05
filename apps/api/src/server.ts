import Fastify from "fastify";
import { reviewRoutes } from "./routes/review.js";

export function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env["LOG_LEVEL"] ?? "info",
    },
  });

  fastify.register(reviewRoutes, { prefix: "/applications" });

  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}

// Only start when run directly
if (process.argv[1]?.endsWith("server.js") || process.argv[1]?.endsWith("server.ts")) {
  const server = buildServer();
  server.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}
