#!/bin/sh
set -eu

chown -R www-data:www-data storage bootstrap/cache
php artisan migrate --force
php artisan storage:link --force

exec apache2-foreground
