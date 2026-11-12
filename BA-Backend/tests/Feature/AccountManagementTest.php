<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Expense;
use App\Models\MonthRecord;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_cannot_grant_administrator_access(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Admin User',
            'email' => 'new@example.com',
            'phoneNumber' => '09123456789',
            'birthday' => '1990-01-01',
            'gender' => 'Other',
            'address' => 'Home address',
            'businessName' => 'Example Business',
            'businessType' => 'Retail',
            'businessAddress' => 'Business address',
            'dateStarted' => '2020-01-01',
            'password' => 'correct-horse-battery',
            'confirmPassword' => 'correct-horse-battery',
            'role' => 'admin',
        ]);

        $response->assertCreated()->assertJsonPath('user.role', 'user');
        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'role' => 'user']);
    }

    public function test_regular_users_are_forbidden_from_admin_endpoints(): void
    {
        Sanctum::actingAs($this->makeUser());

        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_users_cannot_update_another_business_month_record(): void
    {
        $owner = $this->makeUser();
        $ownerBusiness = Business::create([
            'user_id' => $owner->id,
            'business_name' => 'Owner Business',
            'business_type' => 'Retail',
            'business_address' => 'Owner address',
            'date_started' => '2020-01-01',
        ]);
        $record = MonthRecord::create([
            'business_id' => $ownerBusiness->id,
            'year' => 2026,
            'month' => 'January',
            'gross_revenue' => 1000,
            'total_expense' => 200,
            'net_profit' => 800,
            'status' => 'Good',
        ]);
        $expense = Expense::create([
            'month_record_id' => $record->id,
            'name' => 'Rent',
            'value' => 200,
        ]);

        $attacker = $this->makeUser();
        Business::create([
            'user_id' => $attacker->id,
            'business_name' => 'Other Business',
            'business_type' => 'Retail',
            'business_address' => 'Other address',
            'date_started' => '2020-01-01',
        ]);
        Sanctum::actingAs($attacker);

        $this->putJson("/api/month-records/{$record->id}", [
            'gross_revenue' => 1,
            'total_expense' => 0,
            'net_profit' => 1,
            'status' => 'Good',
            'expenses' => [],
        ])->assertNotFound();

        $this->assertDatabaseHas('month_records', [
            'id' => $record->id,
            'gross_revenue' => 1000,
            'net_profit' => 800,
        ]);
        $this->assertDatabaseHas('expenses', ['id' => $expense->id, 'value' => 200]);
    }

    public function test_login_is_rate_limited(): void
    {
        $user = $this->makeUser();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'incorrect-password',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'incorrect-password',
        ])->assertTooManyRequests();
    }

    public function test_admin_can_ban_and_restore_a_user_and_banning_revokes_tokens(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);
        $user = $this->makeUser();
        $user->createToken('test-session');

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonMissingPath('users.0.password');

        $this->patchJson("/api/admin/users/{$user->id}/ban")->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_banned' => true]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);

        $this->patchJson("/api/admin/users/{$user->id}/unban")->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_banned' => false]);
    }

    public function test_password_change_checks_the_current_password(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $this->putJson('/api/profile/password', [
            'currentPassword' => 'incorrect',
            'newPassword' => 'a-new-secure-password',
            'confirmPassword' => 'a-new-secure-password',
        ])->assertUnprocessable();

        $this->putJson('/api/profile/password', [
            'currentPassword' => 'current-password',
            'newPassword' => 'a-new-secure-password',
            'confirmPassword' => 'a-new-secure-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('a-new-secure-password', $user->fresh()->password));
    }

    public function test_profile_edit_updates_only_the_authenticated_users_profile(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $this->postJson('/api/profile', [
            '_method' => 'PUT',
            'name' => 'Updated Name',
            'email' => $user->email,
            'phoneNumber' => '09999999999',
            'birthday' => '1991-02-03',
            'address' => 'Updated address',
            'role' => 'admin',
        ])->assertOk()
            ->assertJsonPath('user.name', 'Updated Name')
            ->assertJsonPath('user.role', 'user');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'phone_number' => '09999999999',
            'role' => 'user',
        ]);
    }

    public function test_business_details_can_be_updated_by_the_owner(): void
    {
        $user = $this->makeUser();
        Business::create([
            'user_id' => $user->id,
            'business_name' => 'Old Business',
            'business_type' => 'Retail',
            'business_address' => 'Old address',
            'date_started' => '2020-01-01',
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/profile/business', [
            '_method' => 'PUT',
            'businessName' => 'New Business',
            'businessType' => 'Services',
            'businessAddress' => 'New address',
            'dateStarted' => '2021-02-03',
        ])->assertOk()->assertJsonPath('business.business_name', 'New Business');

        $this->assertDatabaseHas('businesses', [
            'user_id' => $user->id,
            'business_name' => 'New Business',
            'business_address' => 'New address',
        ]);
    }

    public function test_forgot_password_sends_a_reset_link_without_disclosing_unknown_emails(): void
    {
        Notification::fake();
        $user = $this->makeUser();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');
        Notification::assertSentTo(
            $user,
            ResetPassword::class,
            fn (ResetPassword $notification): bool => str_starts_with(
                $notification->toMail($user)->actionUrl,
                'http://localhost:5173/reset-password?',
            ),
        );

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');

        $this->postJson('/api/forgot-password', ['email' => 'unknown@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');
        Notification::assertCount(1);
    }

    public function test_database_exceptions_do_not_expose_sql_to_api_clients(): void
    {
        Route::get('/api/test-database-error', function () {
            throw new QueryException(
                'pgsql',
                'select * from users',
                [],
                new \RuntimeException('cached plan includes private connection details'),
            );
        });

        $this->getJson('/api/test-database-error')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'A database error occurred. Please try again later.'])
            ->assertDontSee('cached plan');
    }

    public function test_reset_password_uses_a_valid_token_and_revokes_existing_sessions(): void
    {
        $user = $this->makeUser();
        $user->createToken('existing-session');
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-secure-password-2026',
            'password_confirmation' => 'new-secure-password-2026',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-secure-password-2026', $user->fresh()->password));
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_admin_can_be_created_from_the_cli_without_public_registration(): void
    {
        $password = 'Secret-Admin-Password-2026';

        $this->artisan('admin:create')
            ->expectsQuestion('Administrator full name', 'Primary Administrator')
            ->expectsQuestion('Phone number', '09123456789')
            ->expectsQuestion('Birthday (YYYY-MM-DD)', '1990-01-01')
            ->expectsChoice('Gender', 'Other', ['Male', 'Female', 'Other'])
            ->expectsQuestion('Home address', 'Admin office')
            ->expectsQuestion('Password (minimum 12 characters)', $password)
            ->expectsQuestion('Confirm password', $password)
            ->expectsOutputToContain('Administrator account created for admin@gmail.com.')
            ->assertExitCode(0);

        $admin = User::where('email', 'admin@gmail.com')->firstOrFail();
        $this->assertSame('admin', $admin->role);
        $this->assertTrue(Hash::check($password, $admin->password));
    }

    private function makeUser(array $attributes = []): User
    {
        $role = $attributes['role'] ?? null;
        unset($attributes['role']);

        $user = User::create(array_merge([
            'name' => 'Test User',
            'email' => fake()->unique()->safeEmail(),
            'phone_number' => '09123456789',
            'birthday' => '1990-01-01',
            'gender' => 'Other',
            'address' => 'Test address',
            'password' => 'current-password',
        ], $attributes));

        if ($role !== null) {
            $user->role = $role;
            $user->save();
        }

        return $user;
    }
}
