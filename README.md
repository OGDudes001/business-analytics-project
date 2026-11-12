# Business Analytics

Business Analytics is a React/Vite frontend with a Laravel API backend.

## Local development

Requirements: PHP 8.4.1+, Composer, Node.js, and npm.

1. In `BA-Backend`, copy `.env.example` to `.env`, set a private `APP_KEY` with
   `php artisan key:generate`, and configure the database and AI key as needed.
2. Install backend dependencies and migrate the database:

   ```sh
   composer install
   php artisan migrate
   php artisan storage:link
   php artisan serve
   ```

3. In `BA-Frontend`, copy `.env.example` to `.env`, install dependencies, and
   start Vite:

   ```sh
   npm ci
   npm run dev
   ```

The local frontend uses `http://localhost:8000` as its API origin. The local
backend CORS allowlist includes the Vite origins at `localhost:5173` and
`127.0.0.1:5173`.

## Deployment

Deploy the backend and frontend as separate services. Never put backend
credentials in frontend variables; every `VITE_*` value is included in the
public browser bundle.

### Backend

- Use PHP 8.4.1 or later and install production dependencies with
  `composer install --no-dev --optimize-autoloader`.
- Set provider environment variables for `APP_ENV=production`,
  `APP_DEBUG=false`, a generated `APP_KEY`, the production `APP_URL`, database
  connection, `FRONTEND_URL`, and `CORS_ALLOWED_ORIGINS`.
- Run `php artisan migrate --force` as part of deployment, then
  `php artisan storage:link`. Create the first admin on the backend host with
  `php artisan admin:create`.
- Configure a real mail transport if password-reset email is required.
- Uploaded images use Laravel's public disk. Use persistent storage or
  configure object storage (for example S3-compatible storage) before relying
  on uploads across redeployments.

### Frontend on Vercel

- Import the repository and set the project root to `BA-Frontend`.
- Use `npm ci` to install, `npm run build` to build, and `dist` as the output.
- Set `VITE_API_URL` to the backend's public HTTPS origin, for example
  `https://api.example.com`, then redeploy. Do not include `/api` in this
  value.

### CORS and Vercel domains

CORS is the browser's rule for whether JavaScript running on one website may
read responses from a different website. If the frontend is deployed at
`https://business-analytics.vercel.app` and the API is at
`https://api.example.com`, set these backend variables:

```env
FRONTEND_URL=https://business-analytics.vercel.app
CORS_ALLOWED_ORIGINS=https://business-analytics.vercel.app
```

Use the exact frontend origin (scheme and hostname, no trailing slash) and
keep the allowlist limited to sites you control. If you also use a custom
frontend domain or a Vercel preview URL, add each exact origin as a
comma-separated entry in `CORS_ALLOWED_ORIGINS`. Update the backend settings
and redeploy it after changing the allowlist. Vercel previews use different
origins from the production domain, so they are not automatically allowed.

CORS does not make the API private or replace authentication: it only controls
browser access. The API still needs to be publicly reachable over HTTPS, and
the app uses bearer tokens for authenticated requests.

## Environment files

Keep each private `.env` file locally for development; it is ignored by Git.
For an encrypted backup, use a password manager or encrypted storage. Add
production values through your hosting providers' private environment-variable
settings instead of uploading or committing `.env` files. Commit only the
placeholder `.env.example` files.
