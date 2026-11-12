# Business Analytics Frontend

## Development

Create a `.env` file in this directory with the backend origin:

```env
VITE_API_URL=http://localhost:8000
```

Install dependencies and run the Vite development server:

```sh
npm install
npm run dev
```

The Axios client uses this origin and calls the Laravel API under `/api`.

## AI Business Advisor

The floating advisor is available to signed-in users. Configure `GEMINI_API_KEY` in the backend environment; the key must remain server-side and must not be added to a `VITE_*` variable. The backend sends the current question and up to 10 recent chat messages to Gemini and applies authentication, input validation, and rate limiting. Messages are limited to 2,000 characters; advise users not to submit passwords or sensitive personal information.

## Security

The frontend uses API authentication and displays action success/failure messages through toast notifications. These UI measures complement, but do not replace, backend access control, HTTPS, secure deployment configuration, database protections, backups, and monitoring required for the CIA triad.
