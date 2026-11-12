<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## Administrator Access

Public registration always creates a standard user account. Do not grant admin access based on a name, address, business details, or any other user-submitted field.

After deploying this change, run `php artisan migrate` before promoting an account.

Create the first administrator directly on the backend host. The email defaults to `admin@gmail.com`; the command prompts for profile details and a hidden password (minimum 12 characters). No registration-page account is required:

```bash
php artisan admin:create
```

The password is deliberately not stored as a default in source code. If an account already exists, use `php artisan admin:promote trusted@example.com` and confirm only when you recognize that account. Admin access is stored in the server-managed `role` column and checked by admin API middleware. Admins use the existing login page; successful login routes them to the admin dashboard.

## Password Reset Email

Set `FRONTEND_URL` to the deployed frontend origin and configure a real mail transport using the `MAIL_*` environment variables. In local development, Laravel's `log` mailer writes reset links to the backend log instead of sending email.
Set `APP_DEBUG=false` in deployed environments so unexpected exceptions are not exposed to API clients.

## AI Business Advisor

The authenticated advisor endpoint uses Google's Gemini API. Create a key in [Google AI Studio](https://aistudio.google.com/apikey), then set `GEMINI_API_KEY` in the backend `.env` file. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`, a current model for new projects. Never put this key in a frontend `VITE_*` variable or commit it. The advisor sends the current question and up to 10 recent chat messages, limits each message to 2,000 characters, and is rate-limited to 10 requests per minute per user. Free-tier access and limits depend on the Google AI Studio project and current provider terms. Without a configured key, the endpoint responds with `503`.

## CIA Triad Notes

- **Confidentiality:** API routes require Sanctum authentication; admin routes have a separate role check. Passwords are hashed, and the Gemini API key is server-side only. The advisor forwards only the current chat, not stored account or financial records; users should not include personal or sensitive account data.
- **Integrity:** API inputs are validated, data-changing routes operate on the authenticated account, and admin actions require administrator authorization.
- **Availability:** Password-reset and advisor requests are rate-limited; provider calls have a timeout; API database errors return a generic message rather than internal SQL details.

These are application controls, not a complete security certification. For deployment, use HTTPS, set `APP_DEBUG=false`, keep secrets out of source control, restrict database access, and establish backups and monitoring.

## PostgreSQL Pooler After Schema Changes

For PostgreSQL pooler connections, PDO emulated prepares are enabled to avoid stale server-side prepared plans after migrations alter a table's result columns. After running migrations, clear cached Laravel configuration and restart any long-running backend process:

```bash
php artisan config:clear
```

Then stop and restart `php artisan serve` (or redeploy/restart the PHP workers). API database errors are returned with a generic message; the underlying exception remains in the backend log.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
