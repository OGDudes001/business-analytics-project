<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(['user' => $request->user()->load('business')]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phoneNumber' => 'required|string|max:30',
            'birthday' => 'required|date',
            'address' => 'required|string|max:255',
            'profileImage' => 'nullable|image|max:2048',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone_number = $validated['phoneNumber'];
        $user->birthday = $validated['birthday'];
        $user->address = $validated['address'];

        if ($request->hasFile('profileImage')) {
            $previousImage = $user->profile_image;
            $user->profile_image = $request->file('profileImage')->store('profiles', 'public');
            $user->save();
            if ($previousImage) {
                Storage::disk('public')->delete($previousImage);
            }
        } else {
            $user->save();
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh()->load('business'),
        ]);
    }

    public function updateBusiness(Request $request)
    {
        $validated = $request->validate([
            'businessName' => 'required|string|max:255',
            'businessType' => 'required|string|max:255',
            'businessAddress' => 'required|string|max:255',
            'dateStarted' => 'required|date',
            'businessImage' => 'nullable|image|max:2048',
        ]);

        $business = $request->user()->business;
        abort_unless($business, 404, 'Business not found.');

        $business->business_name = $validated['businessName'];
        $business->business_type = $validated['businessType'];
        $business->business_address = $validated['businessAddress'];
        $business->date_started = $validated['dateStarted'];

        if ($request->hasFile('businessImage')) {
            $previousImage = $business->business_image;
            $business->business_image = $request->file('businessImage')->store('businesses', 'public');
            $business->save();
            if ($previousImage) {
                Storage::disk('public')->delete($previousImage);
            }
        } else {
            $business->save();
        }

        return response()->json([
            'message' => 'Business details updated successfully.',
            'business' => $business,
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:8|same:confirmPassword',
            'confirmPassword' => 'required|string',
        ]);

        $user = $request->user();
        if (! Hash::check($validated['currentPassword'], $user->password)) {
            return response()->json(['message' => 'The current password is incorrect.'], 422);
        }

        $user->password = Hash::make($validated['newPassword']);
        $user->save();

        $currentToken = $user->currentAccessToken();
        if ($currentToken && method_exists($currentToken, 'getKey')) {
            $user->tokens()->where('id', '<>', $currentToken->getKey())->delete();
        }

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
