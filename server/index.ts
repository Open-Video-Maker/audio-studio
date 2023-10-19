import { Elysia } from "elysia";

import { APIV1 } from "./api/v1";

const app = new Elysia()
  .group("/api/v1", (app) => app.use(APIV1))
  .get("/", () => "Audio Studio API")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
