<?php

namespace App\Services;

use App\Models\Course\CourseCart;
use App\Models\User;
use App\Services\MediaService;
use App\Services\Course\CourseEnrollmentService;
use App\Services\Course\CoursePlayerService;
use App\Services\Course\CourseWishlistService;
use Illuminate\Support\Facades\Auth;

class StudentService extends MediaService
{
   public function __construct(
      private InstructorService $instructorService,
      private CourseEnrollmentService $enrollmentService,
      private CoursePlayerService $coursePlaybackService,
      private CourseWishlistService $courseWishlistService
   ) {}

   function getCartCount(): int
   {
      $user = Auth::user();
      return CourseCart::where('user_id', $user->id)->count();
   }

   function getStudentData(?string $tab = 'courses'): array
   {
      $props = [];
      $user = Auth::user();
      $instructor = $this->instructorService->getInstructorByUserId($user->id);
      $props['instructor'] = $instructor;

      switch ($tab) {
         case 'courses':
            $enrollments = $this->enrollmentService->getEnrollments(['user_id' => $user->id]);

            foreach ($enrollments as $enrollment) {
               $watch_history = $this->coursePlaybackService->getWatchHistory($enrollment->course_id, $user->id);

               // Only calculate completion if watch history exists
               if ($watch_history) {
                  $completion = $this->coursePlaybackService->calculateCompletion($enrollment->course, $watch_history);
               } else {
                  // New enrollment - 0% completion
                  $completion = [
                     'percentage' => 0,
                     'completed' => 0,
                     'total' => 0,
                  ];
               }

               $enrollment->watch_history = $watch_history;
               $enrollment->completion = $completion;
            }

            $props['enrollments'] = $enrollments;
            break;

         case 'wishlist':
            $wishlists = $this->courseWishlistService->getWishlists(['user_id' => $user->id]);
            $props['wishlists'] = $wishlists;
            break;

         default:
            break;
      }

      return $props;
   }

   function updateProfile(array $data, string $id): User
   {
      $user = User::find($id);

      if (array_key_exists('photo', $data) && $data['photo']) {
         $data['photo'] = $this->addNewDeletePrev($user, $data['photo'], "profile");
      }

      $filteredData = array_filter($data, function ($value) {
         return $value !== null;
      });

      $user->update($filteredData);

      return $user;
   }
}
