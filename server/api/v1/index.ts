import assert from "node:assert";
import { Elysia, t } from "elysia";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { TTSService } from "../../services/tts";
import { generate, SSMLOptions } from "./generate-ms-ssml";
import { S3 } from "../..";

export const APIV1 = (app: Elysia) =>
  app
    .get("/voices", async () => {
      const REGION = process.env.TTS_AZURE_REGION;
      const API_KEY = process.env.TTS_AZURE_API_KEY;
      assert(REGION, "TTS_AZURE_REGION is not set");
      assert(API_KEY, "TTS_AZURE_API_KEY is not set");

      const endpoint = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
      console.log(endpoint, API_KEY);

      const headers = new Headers();
      headers.append("Ocp-Apim-Subscription-Key", API_KEY);
      const resp = await fetch(endpoint, {
        headers,
      });
      const r = await resp.json();
      // console.log(r, API_KEY);

      return r;
    })
    .group("/tts", (app) =>
      app
        .post(
          "/simple",
          async ({ body }) => {
            const { text, language, voiceName } = body;

            try {
              const tts = new TTSService({ language, voiceName });
              const audio = await tts.speakTextAsync(text);
              console.log(`TTS generated ${audio.byteLength} bytes`);
              return new Response(audio, {
                headers: {
                  "Content-Type": "audio/wav",
                },
              });
            } catch (error) {
              return `TTS generated fail ${error}`;
            }
          },
          {
            body: t.Object({
              text: t.String(),
              language: t.Optional(t.String()),
              voiceName: t.Optional(t.String()),
            }),
          }
        )
        .post(
          "/ssml",
          async ({ body }) => {
            const {
              text,
              lang,
              voiceName,
              voiceStyle,
              voiceSpeed,
              voicePitch,
            } = body;

            const ssml = generate({
              text,
              lang,
              voiceName,
              voiceStyle,
              voiceSpeed,
              voicePitch,
            });

            const tts = new TTSService({ language: lang, voiceName });
            const audio = await tts.speakSSMLAsync(ssml);

            const hasher = new Bun.CryptoHasher("sha256");
            hasher.update(text);
            const key = hasher.digest("hex");
            console.log(key);

            const file = new Blob([audio], { type: "audio/wav" });

            Bun.write("./audio.wav", file);

            S3.send(
              // new PutObjectCommand({
              //   Bucket: "ovm",
              //   Key: "test2.txt",
              //   Body: "test1",
              //   ContentType: "text/plain",
              // })
              new PutObjectCommand({
                Bucket: "ovm",
                Key: key,
                Body: Buffer.from(audio),
                ContentType: "audio/wav",
              })
            );

            return new Response(audio, {
              headers: {
                "Content-Type": "audio/wav",
              },
            });
          },
          {
            body: t.Object({
              text: t.String(),
              lang: t.Optional(t.String()),
              voiceName: t.Optional(t.String()),
              voiceStyle: t.Optional(t.String()),
              voiceSpeed: t.Optional(t.Number()),
              voicePitch: t.Optional(t.String()),
            }),
          }
        )
        .post("/batch", () => "batch")
    );
