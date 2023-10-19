import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { swagger } from "@elysiajs/swagger";

import { APIV1 } from "./api/v1";

const app = new Elysia()
  .use(cors())
  .use(html())
  .use(swagger())
  .group("/api/v1", (app) => app.use(APIV1))
  .get("/", ({ html }) =>
    html(
      `<p style="font-family: monospace">Audio Studio API. Please view at <a href='/swagger'>/swagger</a></p>`
    )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
