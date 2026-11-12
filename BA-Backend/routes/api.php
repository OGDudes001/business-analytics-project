<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessAdviceController;
use App\Http\Controllers\MonthRecordController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

// Protected routes group (Requires Login/Sanctum Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/business-advice', BusinessAdviceController::class)->middleware('throttle:10,1');
    Route::get('/month-records', [MonthRecordController::class, 'index']);
    Route::post('/month-records', [MonthRecordController::class, 'store']);
    Route::put('/month-records/{id}', [MonthRecordController::class, 'update']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/business', [ProfileController::class, 'updateBusiness']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index']);
    Route::get('/banned-users', [AdminController::class, 'banned']);
    Route::patch('/users/{user}/ban', [AdminController::class, 'ban']);
    Route::patch('/users/{user}/unban', [AdminController::class, 'unban']);
});
