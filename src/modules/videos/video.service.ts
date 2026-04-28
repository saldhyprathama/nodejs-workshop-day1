import { createReadStream, statSync } from "fs";
import { join } from "path";
import type { Response } from "express";

const VIDEO_PATH = join(process.cwd(), "samples", "videoplayback.mp4");
const CHUNK_SIZE = 1 * 1024 * 1024; // 5MB

export const videoService = {
  streamVideo(rangeHeader: string | undefined, res: Response): void {
    // STEP 1: Get the total file size
    const { size } = statSync(VIDEO_PATH);

    // STEP 2 & 3: Parse Range header, or default to first chunk
    let start: number;
    let end: number;

    if (!rangeHeader) {
      start = 0;
      end = Math.min(CHUNK_SIZE - 1, size - 1);
    } else {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
      start = Number(startStr);
      end = endStr ? Number(endStr) : Math.min(start + CHUNK_SIZE - 1, size - 1);
    }

    // STEP 4: Write HTTP 206 Partial Content headers
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    });

    // STEP 5 & 6: Stream only the requested byte range
    createReadStream(VIDEO_PATH, { start, end }).pipe(res);
  },
};