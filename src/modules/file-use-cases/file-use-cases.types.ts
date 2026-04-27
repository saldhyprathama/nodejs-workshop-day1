export type Contact = {
  name: string;
  email: string;
};

export type Sale = {
  orderId: string;
  customerEmail: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type StreamMetrics = {
  bytes: number;
  chunkCount: number;
  rowCount: number;
  importedCount: number;
};
