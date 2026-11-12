<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteAdminCommand extends Command
{
    protected $signature = 'admin:promote {email : The email address of the existing account}';

    protected $description = 'Promote an existing account to administrator after confirmation';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('No account was found with that email address.');

            return self::FAILURE;
        }

        if ($user->role === 'admin') {
            $this->info('That account is already an administrator.');

            return self::SUCCESS;
        }

        if (! $this->confirm("Promote {$user->email} to administrator?")) {
            $this->warn('No changes were made.');

            return self::FAILURE;
        }

        $user->role = 'admin';
        $user->save();

        $this->info("{$user->email} is now an administrator.");

        return self::SUCCESS;
    }
}
