# Express Fundamentals with TypeScript

This application is designed for a Node.js workshop covering:

- Express server setup
- Routing
- Middleware flow
- DTOs for request and response shapes
- CRUD endpoint structure
- Buffer basics
- Readable, transform, and writable streams
- Backpressure with `pipeline`
- File processing and data transformation

The app uses an in-memory database only. Restarting the server clears all data.

## Recommended Workshop Path

Use these endpoints for teaching. They are intentionally simple, but still use the common backend flow:

- `routes`: define URL and middleware
- `controllers`: read request and send response
- `services`: hold in-memory data and business logic
- `dto`: define data shapes that enter or leave the API

Start from these files:

- [src/modules/products/product.routes.ts](src/modules/products/product.routes.ts)
- [src/modules/products/product.controller.ts](src/modules/products/product.controller.ts)
- [src/modules/products/product.service.ts](src/modules/products/product.service.ts)
- [src/modules/products/product.dto.ts](src/modules/products/product.dto.ts)
- [src/modules/file-use-cases/file-use-cases.routes.ts](src/modules/file-use-cases/file-use-cases.routes.ts)
- [src/modules/file-use-cases/file-use-cases.controller.ts](src/modules/file-use-cases/file-use-cases.controller.ts)
- [src/modules/file-use-cases/file-use-cases.service.ts](src/modules/file-use-cases/file-use-cases.service.ts)
- [src/modules/file-use-cases/file-use-cases.dto.ts](src/modules/file-use-cases/file-use-cases.dto.ts)

## Express Request Flow

For the beginner endpoints, one request moves through this path:

1. `src/server.ts` starts the HTTP server.
2. `src/app.ts` creates the Express app and registers global middleware.
3. `requestLogger` runs first and calls `next()`.
4. Route-level middleware runs next, for example `express.raw()` for the Buffer endpoint or `express.json()` for JSON endpoints.
5. The router matches the URL and calls the controller.
6. The controller validates the DTO and calls the service.
7. The service does the work and returns data.
8. If no route matches, `notFoundHandler` runs. If an error is passed to `next(error)`, `errorHandler` runs.

## Simple Use Cases

### Product CRUD

Endpoint base:

```http
/api/products
```

This version uses one in-memory array in the service and five CRUD routes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

DTO files:

- `CreateProductDto`: required `name`, `price`, and `stock`
- `UpdateProductDto`: optional product fields, but at least one valid field must be sent
- `ProductResponseDto`: product shape returned by the API

Create product:

```bash
curl -X POST http://127.0.0.1:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","price":25000,"stock":20}'
```

List products:

```bash
curl http://127.0.0.1:3000/api/products
```

### Buffer: small contact CSV

Endpoint:

```http
POST /api/files/buffer/contacts
```

Teaching idea:

- Express reads the small file body.
- The body becomes a `Buffer`.
- We check `Buffer.isBuffer(req.body)`.
- We convert the Buffer to text with `toString("utf8")`.
- Then we split rows and transform name/email values.

Try it:

```bash
curl -X POST http://127.0.0.1:3000/api/files/buffer/contacts \
  -H "Content-Type: text/csv" \
  --data-binary @samples/contacts.csv
```

Postman form-data:

- Body: `form-data`
- Key: `file`
- Type: `File`
- Value: choose `samples/contacts.csv`

### Stream: sales CSV row by row

Endpoint:

```http
POST /api/files/stream/sales
```

Teaching idea:

- The request itself is a readable stream.
- Data arrives in chunks.
- `splitLines` is a transform stream that turns chunks into CSV lines.
- `transformSalesRows` turns CSV lines into sale DTOs.
- `saveSales` is a writable stream that stores sales in memory.
- `pipeline` connects readable, transform, and writable streams.
- Backpressure is handled by Node streams. If the writable side is busy, upstream reads slow down.
- The full file does not need to be read as one big value first.

Try it:

```bash
curl -X POST http://127.0.0.1:3000/api/files/stream/sales \
  -H "Content-Type: text/csv" \
  --data-binary @samples/sales.csv
```

Postman form-data:

- Body: `form-data`
- Key: `file`
- Type: `File`
- Value: choose `samples/sales.csv`

### Stream v2: read sales.csv from disk

Endpoint:

```http
POST /api/files/stream/sales/v2
```

Teaching idea:

- This route does not upload a file.
- The server reads `samples/sales.csv` with `fs.createReadStream`.
- `highWaterMark: 256` makes the file arrive in smaller chunks for the demo.
- Each chunk is logged to the server console before rows are transformed.

Try it:

```bash
curl -X POST http://127.0.0.1:3000/api/files/stream/sales/v2
```

## Run

Install dependencies:

```bash
npm install
```

Start in development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start the compiled app:

```bash
npm start
```

Default server URL:

```text
http://127.0.0.1:3000
```

## Test Requests

All curl examples are also collected in [curl-commands.txt](curl-commands.txt).

Health check:

```bash
curl http://127.0.0.1:3000/health
```

Create a product:

```bash
curl -X POST http://127.0.0.1:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Node.js Book","price":150000,"stock":10}'
```

List products:

```bash
curl http://127.0.0.1:3000/api/products
```

Import contacts with Buffer:

```bash
curl -X POST http://127.0.0.1:3000/api/files/buffer/contacts \
  -H "Content-Type: text/csv" \
  --data-binary @samples/contacts.csv
```

Import contacts with Buffer using form-data:

```bash
curl -X POST http://127.0.0.1:3000/api/files/buffer/contacts \
  -F "file=@samples/contacts.csv;type=text/csv"
```

List imported contacts:

```bash
curl http://127.0.0.1:3000/api/files/buffer/contacts
```

Import sales with Stream:

```bash
curl -X POST http://127.0.0.1:3000/api/files/stream/sales \
  -H "Content-Type: text/csv" \
  --data-binary @samples/sales.csv
```

Import sales with Stream using form-data:

```bash
curl -X POST http://127.0.0.1:3000/api/files/stream/sales \
  -F "file=@samples/sales.csv;type=text/csv"
```

Import sales with Stream v2 from the local sample file:

```bash
curl -X POST http://127.0.0.1:3000/api/files/stream/sales/v2
```

List imported sales:

```bash
curl http://127.0.0.1:3000/api/files/stream/sales
```

## Route Summary

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Server health check |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product by id |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/files/buffer/contacts` | Contact CSV import with Buffer |
| GET | `/api/files/buffer/contacts` | List buffered contacts |
| POST | `/api/files/stream/sales` | Sales CSV import with Stream |
| POST | `/api/files/stream/sales/v2` | Sales CSV import from server file stream |
| GET | `/api/files/stream/sales` | List streamed sales |

## Project Structure

```text
src/
  app.ts
  server.ts
  shared/http/
  modules/
    products/
      product.dto.ts
      product.routes.ts
      product.controller.ts
      product.service.ts
    file-use-cases/
      file-use-cases.dto.ts
      file-use-cases.routes.ts
      file-use-cases.controller.ts
      file-use-cases.service.ts
```

The modules are intentionally simple for the workshop and only use routes, controllers, services, DTOs, and small types.
