import type { Contact, Sale } from "./file-use-cases.types";

export type ContactDto = Contact;

export type SaleDto = Sale;

export type BufferImportResultDto = {
  bufferSizeInBytes: number;
  importedCount: number;
  data: ContactDto[];
};

export type StreamImportResultDto = {
  bytes: number;
  chunkCount: number;
  rowCount: number;
  importedCount: number;
  data: SaleDto[];
};
