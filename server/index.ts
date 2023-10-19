import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { APIV1 } from "./api/v1";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .group("/api/v1", (app) => app.use(APIV1))
  .get("/", () => "Audio Studio API")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
