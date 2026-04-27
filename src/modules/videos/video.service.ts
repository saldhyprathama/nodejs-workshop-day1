import { createReadStream, statSync } from "fs";
import { join } from "path";
import type { Response } from "express";

const VIDEO_PATH = join(process.cwd(), "samples", "videoplayback.mp4");
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

export const videoService = {
  // ─────────────────────────────────────────────────────────────────
  //    YOUR TURN — implement streamVideoV2
  //    Read WORKSHOP_HINTS.txt for step-by-step guidance.
  //    Endpoint: GET /api/videos/stream-v2
  // ─────────────────────────────────────────────────────────────────
  streamVideo(rangeHeader: string | undefined, res: Response): void {
    // STEP 1: Get the total file size using statSync

    // STEP 2: Parse the Range header (e.g. "bytes=0-")

    // STEP 3: Handle when there is NO Range header

    // STEP 4: Write HTTP 206 response headers
    // res.writeHead(206, { "Content-Range": ..., "Accept-Ranges": ..., "Content-Length": ..., "Content-Type": ... })

    // STEP 5: Create a read stream with { start, end }
    // const stream = createReadStream(VIDEO_PATH, { start, end })

    // STEP 6: Pipe the stream to the response
    // stream.pipe(res)

    res
      .status(501)
      .json({ message: "Not implemented yet — check WORKSHOP_HINTS.txt!" });
  },
};
