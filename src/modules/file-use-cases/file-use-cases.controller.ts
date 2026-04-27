import { Readable } from "stream";
import type { RequestHandler } from "express";
import { fileUseCasesService } from "./file-use-cases.service";
import { extractMultipartFile, isMultipartRequest, readRequestBody } from "./multipart-file.parser";

export const importContactsWithBuffer: RequestHandler = (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ message: "Send CSV text as the request body" });
  }

  try {
    const fileBuffer = isMultipartRequest(req)
      ? extractMultipartFile(req.body, String(req.headers["content-type"] ?? "")).buffer
      : req.body;

    const result = fileUseCasesService.importContactsFromBuffer(fileBuffer);

    return res.status(201).json({
      message: "Small CSV processed with Buffer",
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid contacts CSV"
    });
  }
};

export const importSalesWithStream: RequestHandler = async (req, res) => {
  try {
    const requestStream = isMultipartRequest(req)
      ? Readable.from(
          extractMultipartFile(await readRequestBody(req), String(req.headers["content-type"] ?? "")).buffer
        )
      : req;
    const result = await fileUseCasesService.importSalesFromStream(requestStream);

    return res.status(201).json({
      message: "CSV processed with Stream",
      concept: "Readable request stream -> Transform rows -> Writable memory store. pipeline manages backpressure.",
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid sales CSV"
    });
  }
};

export const importSalesWithStreamV2: RequestHandler = async (_req, res) => {
  try {
    const result = await fileUseCasesService.importSalesFromFileStream();

    return res.status(201).json({
      message: "CSV processed with real file stream",
      concept:
        "fs.createReadStream reads samples/sales.csv in chunks, then the pipeline transforms rows and writes results to memory.",
      source: "samples/sales.csv",
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid sales CSV file"
    });
  }
};

export const listBufferedContacts: RequestHandler = (_req, res) => {
  res.json({
    data: fileUseCasesService.getContacts()
  });
};

export const listStreamedSales: RequestHandler = (_req, res) => {
  res.json({
    data: fileUseCasesService.getSales()
  });
};
