<?php

use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\CardRedemptionController;
use App\Http\Controllers\Course\CourseCartController;
use App\Http\Controllers\Course\CourseEnrollmentController;
use App\Http\Controllers\Course\CourseForumController;
use App\Http\Controllers\Course\CourseForumReplyController;
use App\Http\Controllers\Course\CourseReviewController;
use App\Http\Controllers\Course\CourseWishlistController;
use App\Http\Controllers\Course\PlayerController;
use App\Http\Controllers\Course\QuizSubmissionController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\LiveClassController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::get('student/{tab}', [StudentController::class, 'index'])->name('student.index')->middleware('smtpConfig');
Route::post('student/profile', [StudentController::class, 'update_profile'])->name('student.profile.update');

// Card Redemption Routes
Route::prefix('card')->group(function () {
    Route::get('redeem', [CardRedemptionController::class, 'index'])->name('card.redeem');
    Route::post('redeem/validate', [CardRedemptionController::class, 'validate'])->name('card.redeem.validate');
    Route::post('redeem/activate', [CardRedemptionController::class, 'redeem'])->name('card.redeem.activate');
    Route::get('history', [CardRedemptionController::class, 'history'])->name('card.redeem.history');
});

Route::controller(InstructorController::class)->middleware(['smtpConfig', 'checkSmtp', 'checkCourseCreation'])->group(function () {
    Route::post('become-instructor', 'store')->name('become-instructor.store');
    Route::post('become-instructor/{id}', 'update')->name('become-instructor.update');
});

Route::resource('course-cart', CourseCartController::class)->except(['create', 'show', 'edit']);

Route::post('enrollments', [CourseEnrollmentController::class, 'store'])->name('enrollments.store');

Route::resource('course-wishlists', CourseWishlistController::class)->only(['store', 'destroy']);

Route::resource('quiz-submissions', QuizSubmissionController::class)->only(['store']);

Route::controller(PlayerController::class)->middleware(['checkEnroll'])->group(function () {
    Route::post('player/init/watch-history', 'intWatchHistory')->name('player.init.watch-history');
    Route::get('play-course/{type}/{watch_history}/{lesson_id}', 'course_player')->name('course.player');
    Route::get('play-course/finish/{watch_history}', 'finish_course')->name('course.player.finish');
});

Route::resource('notifications', NotificationController::class)->only(['index', 'show']);
Route::put('notifications/mark-as-read/all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');

Route::resource('course-forums', CourseForumController::class)->only(['store', 'update', 'destroy']);
Route::resource('course-forum-replies', CourseForumReplyController::class)->only(['store', 'update', 'destroy']);
Route::resource('course-reviews', CourseReviewController::class)->only(['store', 'update', 'destroy']);

// settings
Route::middleware('smtpConfig', 'checkSmtp')->prefix('settings/account')->group(function () {
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('account.forgot-password');
    Route::put('change-password', [PasswordResetLinkController::class, 'update'])->name('account.change-password');

    Route::post('change-email', [EmailVerificationNotificationController::class, 'update'])->name('account.change-email');
    Route::get('change-email/save', [EmailVerificationNotificationController::class, 'save'])->name('account.save-email');
});

// Live class routes accessible to both instructors and students
Route::get('live-class/start/{id}', [LiveClassController::class, 'index'])->name('live-class.start');
Route::get('live-class/signature/{id}', [LiveClassController::class, 'signature'])->name('live-class.signature');

// users
Route::delete('users/{id}', [UsersController::class, 'destroy'])->name('users.destroy');
