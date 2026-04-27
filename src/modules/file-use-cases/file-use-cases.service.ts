import { createReadStream } from "fs";
import { join } from "path";
import { Transform, Writable } from "stream";
import { pipeline } from "stream/promises";
import type { BufferImportResultDto, StreamImportResultDto } from "./file-use-cases.dto";
import type { Contact, Sale, StreamMetrics } from "./file-use-cases.types";

const contacts: Contact[] = [];
const sales: Sale[] = [];

const parseContactCsvLine = (line: string): Contact => {
  const [name = "", email = ""] = line.split(",");

  return {
    name: name.replaceAll("\"", "").trim().replace(/\s+/g, " "),
    email: email.trim().toLowerCase()
  };
};

const parseSaleCsvLine = (line: string): Sale => {
  const [orderId, customerEmail, item, quantityText, unitPriceText] = line.split(",");
  const quantity = Number(quantityText);
  const unitPrice = Number(unitPriceText);

  return {
    orderId: orderId.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    item: item.trim(),
    quantity,
    unitPrice,
    total: quantity * unitPrice
  };
};

const importSales = async (inputStream: NodeJS.ReadableStream): Promise<StreamImportResultDto> => {
  let unfinishedLine = "";
  let hasSkippedHeader = false;
  const importedSales: Sale[] = [];
  const metrics: StreamMetrics = {
    bytes: 0,
    chunkCount: 0,
    rowCount: 0,
    importedCount: 0
  };

  const splitLines = new Transform({
    readableObjectMode: true,
    transform(chunk: Buffer, _encoding, callback) {
      metrics.bytes += chunk.byteLength;
      metrics.chunkCount += 1;

      const chunkText = chunk.toString("utf8");

      console.log(`[stream chunk ${metrics.chunkCount}]`, {
        bytes: chunk.byteLength,
        data: chunkText
      });

      const text = unfinishedLine + chunkText;
      const lines = text.split(/\r?\n/);
      unfinishedLine = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim()) {
          this.push(line.trim());
        }
      }

      callback();
    },
    flush(callback) {
      if (unfinishedLine.trim()) {
        this.push(unfinishedLine.trim());
      }

      callback();
    }
  });

  const transformSalesRows = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(line: string, _encoding, callback) {
      if (!hasSkippedHeader) {
        hasSkippedHeader = true;
        callback();
        return;
      }

      metrics.rowCount += 1;
      this.push(parseSaleCsvLine(line));
      callback();
    }
  });

  const saveSales = new Writable({
    objectMode: true,
    highWaterMark: 2,
    write(sale: Sale, _encoding, callback) {
      sales.push(sale);
      importedSales.push(sale);
      metrics.importedCount += 1;
      callback();
    }
  });

  // pipeline connects readable -> transform -> writable.
  // If the writable is busy, Node slows the readable side down. That is backpressure.
  await pipeline(inputStream, splitLines, transformSalesRows, saveSales);

  return {
    ...metrics,
    data: importedSales
  };
};

export const fileUseCasesService = {
  importContactsFromBuffer(fileBuffer: Buffer): BufferImportResultDto {
    // Buffer idea: the complete small file is already in memory here.
    const fileText = fileBuffer.toString("utf8");
    const lines = fileText.trim().split("\n").slice(1);
    const importedContacts: Contact[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const contact = parseContactCsvLine(line);
      contacts.push(contact);
      importedContacts.push(contact);
    }

    return {
      bufferSizeInBytes: fileBuffer.byteLength,
      importedCount: importedContacts.length,
      data: importedContacts
    };
  },

  async importSalesFromStream(requestStream: NodeJS.ReadableStream): Promise<StreamImportResultDto> {
    return importSales(requestStream);
  },

  async importSalesFromFileStream(): Promise<StreamImportResultDto> {
    const salesFilePath = join(process.cwd(), "samples", "sales.csv");
    const fileStream = createReadStream(salesFilePath, {
      highWaterMark: 256
    });

    return importSales(fileStream);
  },

  getContacts() {
    return contacts;
  },

  getSales() {
    return sales;
  }
};
