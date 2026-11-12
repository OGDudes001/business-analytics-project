<?php

namespace App\Http\Controllers;

use App\Models\User;

class AdminController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::with('business')
                ->where('role', 'user')
                ->where('is_banned', false)
                ->latest()
                ->get(),
        ]);
    }

    public function banned()
    {
        return response()->json([
            'users' => User::with('business')
                ->where('role', 'user')
                ->where('is_banned', true)
                ->latest()
                ->get(),
        ]);
    }

    public function ban(User $user)
    {
        abort_if($user->role !== 'user', 422, 'Only standard user accounts can be banned.');

        $user->is_banned = true;
        $user->save();
        $user->tokens()->delete();

        return response()->json(['message' => 'User account banned successfully.']);
    }

    public function unban(User $user)
    {
        abort_if($user->role !== 'user', 422, 'Only standard user accounts can be unbanned.');

        $user->is_banned = false;
        $user->save();

        return response()->json(['message' => 'User account restored successfully.']);
    }
}
