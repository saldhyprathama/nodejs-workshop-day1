export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => {
  return new HttpError(400, message, details);
};

export const notFound = (message: string) => {
  return new HttpError(404, message);
};
