import express from "express";
import { join } from "path";
import { fileUseCasesRoutes } from "./modules/file-use-cases/file-use-cases.routes";
import { videoRoutes } from "./modules/videos/video.routes";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from "./shared/http/middleware";

export const app = express();

app.use(requestLogger);

// Serve static workshop UI
app.use(express.static(join(process.cwd(), "public")));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    topics: [
      "server setup",
      "routing",
      "middleware",
      "buffer",
      "stream",
      "crud",
    ],
  });
});

// These routes intentionally run before JSON parsing.
// Buffer route needs the raw request body; stream route needs the request as a stream.
app.use("/api/files", fileUseCasesRoutes);

app.use(express.json({ limit: "100kb" }));
app.use("/api/videos", videoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
