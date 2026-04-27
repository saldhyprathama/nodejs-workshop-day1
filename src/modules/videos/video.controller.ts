import type { RequestHandler } from "express";
import { videoService } from "./video.service";

// 🚧 Workshop challenge — wired up, waiting for streamVideoV2 implementation
export const streamVideo: RequestHandler = (_req, res) => {
  const range = _req.headers.range;
  videoService.streamVideo(range, res);
};
