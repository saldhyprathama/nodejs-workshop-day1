import { Router } from "express";
import { streamVideo } from "./video.controller";

export const videoRoutes = Router();

// Workshop challenge endpoint — implement streamVideoV2 in video.service.ts
videoRoutes.get("/stream", streamVideo);
