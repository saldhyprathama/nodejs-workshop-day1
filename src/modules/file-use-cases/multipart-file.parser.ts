import type { Request } from "express";

type MultipartFile = {
  buffer: Buffer;
  filename?: string;
};

const getBoundary = (contentType: string) => {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] ?? match?.[2];
};

const splitBuffer = (buffer: Buffer, separator: Buffer) => {
  const parts: Buffer[] = [];
  let start = 0;
  let separatorIndex = buffer.indexOf(separator, start);

  while (separatorIndex !== -1) {
    parts.push(buffer.subarray(start, separatorIndex));
    start = separatorIndex + separator.length;
    separatorIndex = buffer.indexOf(separator, start);
  }

  parts.push(buffer.subarray(start));
  return parts;
};

const trimMultipartPart = (part: Buffer) => {
  let start = 0;
  let end = part.length;

  if (part.subarray(0, 2).equals(Buffer.from("\r\n"))) {
    start = 2;
  }

  if (part.subarray(end - 2).equals(Buffer.from("\r\n"))) {
    end -= 2;
  }

  return part.subarray(start, end);
};

export const isMultipartRequest = (req: Request) => {
  const contentType = String(req.headers["content-type"] ?? "");
  return contentType.toLowerCase().includes("multipart/form-data");
};

export const readRequestBody = async (req: Request) => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

export const extractMultipartFile = (body: Buffer, contentType: string): MultipartFile => {
  const boundary = getBoundary(contentType);

  if (!boundary) {
    throw new Error("Missing multipart boundary");
  }

  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");
  const parts = splitBuffer(body, boundaryBuffer);

  for (const part of parts) {
    const cleanPart = trimMultipartPart(part);

    if (cleanPart.length === 0 || cleanPart.equals(Buffer.from("--"))) {
      continue;
    }

    const headerEndIndex = cleanPart.indexOf(headerSeparator);

    if (headerEndIndex === -1) {
      continue;
    }

    const headers = cleanPart.subarray(0, headerEndIndex).toString("utf8");
    const content = cleanPart.subarray(headerEndIndex + headerSeparator.length);
    const isFileField = /filename=/i.test(headers) || /name="file"/i.test(headers);

    if (!isFileField) {
      continue;
    }

    const filename = headers.match(/filename="([^"]+)"/i)?.[1];
    return {
      buffer: content,
      filename
    };
  }

  throw new Error('Send a form-data file field named "file"');
};
