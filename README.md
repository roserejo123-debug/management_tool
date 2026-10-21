# PropEstate

MERN real-estate platform. The React/Vite app is in `client/`; the Express/MongoDB API is in `server/`.

## Deployment layout

The repository includes a Render Blueprint for the API (`render.yaml`) and Vercel configuration for the client (`client/vercel.json`).

### 1. Deploy the API to Render

1. Create or connect a MongoDB Atlas database and a Cloudinary account.
2. In Render, create a Blueprint from this repository and review the `propestate-api` service.
3. Provide these secret values in the Render service environment. Never put real values in this repository:
   - `MONGO_URI`: Atlas connection URI, with a database name and URL-encoded credentials.
   - `JWT_SECRET`: a cryptographically random value of at least 32 characters.
   - `CLIENT_URL`: the exact deployed Vercel origin, such as `https://your-app.vercel.app`. Multiple allowed origins can be comma-separated.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - `EMAIL_USER`, `EMAIL_PASS`: SMTP/Gmail credentials used for password reset and visit-confirmation email.
4. Deploy and check `https://<your-render-service>/health`. It should return HTTP 200 and `{"success":true,"status":"ready","database":"connected"}`.
5. In MongoDB Atlas, allow network access from the API host. Prefer a narrowly scoped network rule or supported private connectivity; do not leave an unrestricted database rule in place for production.

The API starts listening only after MongoDB connects, validates required environment settings, restricts CORS to `CLIENT_URL`, and handles termination signals. Render supplies `PORT`.

### 2. Deploy the client to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to `client`.
2. Add the build-time environment variable `VITE_API_URL=https://<your-render-service>/api` for Preview and Production (and Development if needed).
3. Deploy. `client/vercel.json` configures the Vite build output and React Router fallback rewrites.
4. Add each Vercel origin used by production/preview to the Render `CLIENT_URL` variable, comma-separated, then redeploy the API.

For local development, copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`, then replace every placeholder with valid local service credentials. Do not commit `.env` files.

## What still needs external setup and verification

- Production database, Cloudinary, and email credentials must be supplied by the owner in the respective service dashboards.
- The API and client must be deployed, then tested using those live services. A successful local build does not verify credentials, CORS, DNS, Atlas network access, image upload, outbound email, or the end-to-end booking/review workflows.
- Configure a custom domain and HTTPS only if required; Vercel and Render provide HTTPS for their default domains.
