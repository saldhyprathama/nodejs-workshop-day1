import express, { Router } from "express";
import {
  importContactsWithBuffer,
  importSalesWithStream,
  importSalesWithStreamV2,
  listBufferedContacts,
  listStreamedSales
} from "./file-use-cases.controller";

export const fileUseCasesRoutes = Router();

fileUseCasesRoutes.post(
  "/buffer/contacts",
  express.raw({ type: ["text/csv", "text/plain", "multipart/form-data"], limit: "500kb" }),
  importContactsWithBuffer
);

fileUseCasesRoutes.post("/stream/sales", importSalesWithStream);
fileUseCasesRoutes.post("/stream/sales/v2", importSalesWithStreamV2);
fileUseCasesRoutes.get("/buffer/contacts", listBufferedContacts);
fileUseCasesRoutes.get("/stream/sales", listStreamedSales);
