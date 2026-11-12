<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create {email=admin@gmail.com : Email address for the administrator}';

    protected $description = 'Create an administrator directly from the backend CLI';

    public function handle(): int
    {
        $email = $this->argument('email');
        if (User::where('email', $email)->exists()) {
            $this->error('That email address already has an account. Use admin:promote if you trust that account.');

            return self::FAILURE;
        }

        $attributes = [
            'name' => $this->ask('Administrator full name', 'Administrator'),
            'email' => $email,
            'phone_number' => $this->ask('Phone number'),
            'birthday' => $this->ask('Birthday (YYYY-MM-DD)'),
            'gender' => $this->choice('Gender', ['Male', 'Female', 'Other']),
            'address' => $this->ask('Home address'),
        ];

        $validator = Validator::make($attributes, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone_number' => 'required|string|max:30',
            'birthday' => 'required|date|before_or_equal:today',
            'gender' => 'required|in:Male,Female,Other',
            'address' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }

        $password = $this->secret('Password (minimum 12 characters)');
        $passwordValidator = Validator::make(
            ['password' => $password],
            ['password' => ['required', Password::min(12)]],
        );

        if ($passwordValidator->fails()) {
            $this->error($passwordValidator->errors()->first());

            return self::FAILURE;
        }

        if (! hash_equals($password, (string) $this->secret('Confirm password'))) {
            $this->error('The passwords do not match.');

            return self::FAILURE;
        }

        $user = DB::transaction(function () use ($attributes, $password): User {
            $user = User::create([
                ...$attributes,
                'password' => Hash::make($password),
            ]);
            $user->role = 'admin';
            $user->save();

            return $user;
        });

        $this->info("Administrator account created for {$user->email}.");

        return self::SUCCESS;
    }
}
