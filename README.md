## x402 URL Shortener — Backend

A Node.js/Express backend for a simple URL shortener with user auth, paid URL creation via x402 micro-payments, redirect handling, and basic analytics. Data is stored in MongoDB via Mongoose. Sessions are tracked in-memory using a cookie-based session id.

### Tech Stack
- **Runtime**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: In-memory session map + cookie `uid`
- **Payments**: `x402-express` (micropayments on specified network)
- **Misc**: `cors`, `cookie-parser`, `dotenv`, `shortid`, `uuid`

### Running Locally
1. Ensure MongoDB is running and reachable (local or remote).
2. Create a `.env` file in `backend/` (see Environment Variables below).
3. Install dependencies and start the server:

```bash
cd backend
npm install
npm start
```

The server listens on `http://localhost:8001` by default.

### Environment Variables (.env)
- `MONGODB_URL`: Mongo connection string. Default: `mongodb://localhost:27017/short-url`
- `X402_RECEIVER`: Required. Receiver wallet/address for payments.
- `X402_PRICE_USD`: Required. Price per POST `/url` request in USD (e.g., `0.01` or `$0.01`).
- `X402_NETWORK`: Network for x402. Default: `base-sepolia`.
- `X402_FACILITATOR_URL`: x402 facilitator URL. Default: `https://x402.org/facilitator`.

Notes:
- CORS is set to `http://localhost:5173` with credentials enabled.
- Sessions are in-memory; restarting the server logs users out.

### Payments (x402)
The `POST /url` route is wrapped with an x402 payment middleware created in `middlewares/x402.js`. The route requires a successful micro-payment per request. Configuration is derived from environment variables listed above.

### API

- GET `/`
  - Health/info endpoint.
  - Response: `{ ok: true, service: "x402-url-shortener", version: "1.0" }`

- GET `/url/:shortId`
  - Redirects to the original URL and records a visit timestamp.
  - Errors: `404` if `shortId` not found.

- POST `/user`
  - Create a new user.
  - Body JSON:
    ```json
    { "name": "Alice", "email": "alice@example.com", "password": "pass" }
    ```
  - Responses:
    - `201`: `{ "message": "User Created !!" }`
    - `500`: `{ "message": "Error creating USer !!" }`

- POST `/user/login`
  - Login with email and password. Sets `uid` cookie on success.
  - Body JSON:
    ```json
    { "email": "alice@example.com", "password": "pass" }
    ```
  - Responses:
    - `200`: `{ "message": "User Logged In !!" }`
    - `401`: `{ "error": "Invalid Username or Password" }`

- POST `/url` (Protected + Paid)
  - Requires `uid` cookie (logged-in user) and x402 payment.
  - Body JSON:
    ```json
    { "url": "https://example.com" }
    ```
  - Response:
    - `201`: `{ "id": "<shortId>" }`
  - Errors:
    - `400`: `{ "error": "url is required" }`

- GET `/url/analytics/:shortId` (Protected)
  - Returns total clicks and visit history for a short link.
  - Response:
    ```json
    { "totalClicks": 3, "analytics": [{ "timestamp": 1730854000000 }] }
    ```

### Data Models (Mongoose)
- User: `{ name, email (unique), password }`
- URL: `{ shortId (unique), redirectURL, visitHistory: [{ timestamp }], createdBy }`

### Development Notes
- For production, replace plaintext passwords with hashed passwords (e.g., bcrypt) and move sessions to a persistent store (e.g., Redis).
- Consider making CORS origin configurable via environment variables.
- `createdBy` references the creator’s user id; ensure the `ref` matches your users collection name if you rename the model.


