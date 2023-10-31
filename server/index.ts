import assert from "node:assert";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { swagger } from "@elysiajs/swagger";

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { APIV1 } from "./api/v1";

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
assert(ACCOUNT_ID, "ACCOUNT_ID is not set");
assert(ACCESS_KEY_ID, "ACCESS_KEY_ID is not set");
assert(SECRET_ACCESS_KEY, "SECRET_ACCESS_KEY is not set");

export const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const app = new Elysia()
  .use(cors())
  .use(html())
  .use(swagger())
  .group("/api/v1", (app) => app.use(APIV1))
  .group("/v2", (app) => app.get("/test", () => ({ test: "test" })))
  .get("/", ({ html }) =>
    html(
      `<p style="font-family: monospace">Audio Studio API. Please view at <a href='/swagger'>/swagger</a></p>`
    )
  )
  .get("/test", async () => {
    const v = await Bun.file("./output.mp4");
    // Bun.write("./aaa.mp4", new Blob([v], { type: "video/mp4" }));
    // return { size: v.size, type: v.type };
    return new Response(v, {
      headers: {
        "Content-Type": "video/mp4",
      },
    });
  })
  .get("/getObject", async () => {
    const result = await S3.send(
      new GetObjectCommand({ Bucket: "ovm", Key: "output.mp4" })
    );
    // const r = await result.Body?.transformToString();
    console.log(result);
    return new Response(result.Body?.transformToWebStream(), {
      headers: {
        "Content-Type": "video/mp4",
      },
    });
    return "test";
  })
  .get("/putObject", async () => {
    const result = await S3.send(
      new PutObjectCommand({ Bucket: "ovm", Key: "test", Body: "test" })
    );
    console.log(result);
    return "put object";
  })
  .get("/web", ({ html }) =>
    html(`
  <!doctype html>
  <html lang="en">
    <head>
      <script type="module">
  import RefreshRuntime from "http://localhost:5173/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
  </script>

      <script type="module" src="http://localhost:5173/@vite/client"></script>

      <meta charset="UTF-8" />
      <!-- <link rel="icon" type="image/svg+xml" href="/vite.svg" /> -->
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OVM - Audio Studio</title>
    </head>
    <body class="bg-slate-100">
      <div id="root"></div>
      <script type="module" src="http://localhost:5173/client/main.tsx"></script>
    </body>
  </html>
  `)
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
