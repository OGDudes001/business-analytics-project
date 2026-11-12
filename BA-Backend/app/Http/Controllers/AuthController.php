<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phoneNumber' => 'required|string|max:30',
            'birthday' => 'required|date',
            'gender' => 'required|string|in:Male,Female,Other',
            'address' => 'required|string|max:255',
            'profileImage' => 'nullable|image|max:2048',
            'businessName' => 'required|string|max:255',
            'businessType' => 'required|string|max:255',
            'businessAddress' => 'required|string|max:255',
            'dateStarted' => 'required|date',
            'businessImage' => 'nullable|image|max:2048',
            'password' => 'required|string|min:8|same:confirmPassword',
            'confirmPassword' => 'required|string',
        ]);

        $profileImagePath = null;
        if ($request->hasFile('profileImage')) {
            $profileImagePath = $request->file('profileImage')->store('profiles', 'public');
        }

        $businessImagePath = null;
        if ($request->hasFile('businessImage')) {
            $businessImagePath = $request->file('businessImage')->store('businesses', 'public');
        }

        [$user, $business] = DB::transaction(function () use ($validated, $profileImagePath, $businessImagePath) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phoneNumber'],
                'birthday' => $validated['birthday'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'profile_image' => $profileImagePath,
                'password' => Hash::make($validated['password']),
                'is_banned' => false,
            ]);

            $business = $user->business()->create([
                'business_name' => $validated['businessName'],
                'business_type' => $validated['businessType'],
                'date_started' => $validated['dateStarted'],
                'business_image' => $businessImagePath,
                'business_address' => $validated['businessAddress'],
            ]);

            return [$user, $business];
        });

        return response()->json([
            'message' => 'Account registered successfully!',
            'user' => $user->fresh()->load('business'),
            'business' => $business,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('business')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'This account has been banned by the administrator.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
            'business' => $user->business,
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->load('business')]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }
}
