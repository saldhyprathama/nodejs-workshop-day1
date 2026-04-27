import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "./errors";

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationInMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${durationInMs}ms`);
  });

  next();
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }

  if (err instanceof Error && "type" in err && err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body is too large"
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal server error"
  });
};
