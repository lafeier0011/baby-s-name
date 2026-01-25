import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { generateNames } from "./name-generator.tsx";
import { rateLimitMiddleware } from "./rate-limiter.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-093e7da9/health", (c) => {
  return c.json({ status: "ok" });
});

// Name generation endpoint
app.post("/make-server-093e7da9/generate-names", rateLimitMiddleware, generateNames);

Deno.serve(app.fetch);