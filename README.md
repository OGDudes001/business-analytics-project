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

- The backend includes a Docker setup for Render. Create a Web Service from
  this repository, select Docker, set the Root Directory to `BA-Backend`, and
  use `/up` as the health check path. The image installs production Composer
  dependencies and runs migrations when the service starts.
- Set backend environment variables in Render, not in GitHub. At minimum,
  configure `APP_KEY`, `APP_URL`, `DB_CONNECTION=pgsql`, `DB_URL`,
  `FRONTEND_URL`, and `CORS_ALLOWED_ORIGINS`. Also set `APP_ENV=production`,
  `APP_DEBUG=false`, and `GEMINI_API_KEY` if the advisor is enabled.
- Generate a production key with `php artisan key:generate --show` from the
  backend directory and enter the result directly into Render's environment
  settings. Do not commit or share the key.
- The container runs `php artisan migrate --force` and `php artisan storage:link`
  at startup. Create the first admin on the backend host with
  `php artisan admin:create`.
- Configure a real mail transport if password-reset email is required.
- Uploaded images use Laravel's public disk. Render's Free web services have
  ephemeral storage, so uploaded images can disappear on restarts or spin-down.
  To keep them, use a paid Render persistent disk mounted at
  `/var/www/html/storage/app/public`, or configure external object storage.

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
