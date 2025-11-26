<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Course\CourseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\JobCircularController;
use App\Http\Controllers\SubscribeController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\SalesPointController;
use App\Http\Controllers\CardRedemptionController;
use Illuminate\Support\Facades\Route;
use Modules\Installer\Http\Controllers\InstallerController;

Route::get('/', [HomeController::class, 'index'])->name('home')->middleware('customize');
Route::get('demo/{slug}', [HomeController::class, 'demo'])->name('home.demo')->middleware('customize');
Route::get('job-circulars/{job_circular}', [JobCircularController::class, 'show'])->name('job-circulars.show');

// course page
Route::controller(CourseController::class)->group(function () {
    Route::get('courses/{category}/{category_child?}', 'category_courses')->name('category.courses');
    Route::get('courses/details/{slug}/{id}', 'show')->name('course.details');
});

Route::get('instructors/{instructor}', [InstructorController::class, 'show'])->name('instructors.show');
Route::resource('subscribes', SubscribeController::class)->only(['index', 'store']);

// Sales Points (public)
Route::get('sales-points', [SalesPointController::class, 'index'])->name('public.sales-points.index');
Route::get('sales-points/{id}', [SalesPointController::class, 'show'])->name('public.sales-points.show');
Route::get('api/sales-points', [SalesPointController::class, 'api'])->name('public.sales-points.api');
Route::get('api/ads', [AdController::class, 'index'])->name('api.ads.index');

// Card Redemption routes are now in routes/student.php
