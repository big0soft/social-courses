<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStudentProfileRequest;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function __construct(private StudentService $studentService) {}

    /**
     * Display the student profile page.
     */
    public function index(Request $request, string $tab)
    {
        $hasVerifiedEmail = $request->user()->hasVerifiedEmail();

        if ($tab !== 'courses' && !$request->user()->hasVerifiedEmail()) {
            return redirect()
                ->route('student.index', ['tab' => 'courses'])
                ->with('error', 'Please verify your email address.');
        }

        $props = $this->studentService->getStudentData($tab);

        return Inertia::render('student/index', [
            ...$props,
            'tab' => $tab,
            'status' => $request->session()->get('status'),
            'hasVerifiedEmail' => $hasVerifiedEmail,
        ]);
    }

    /**
     * Update the authenticated student's profile information.
     */
    public function update_profile(UpdateStudentProfileRequest $request)
    {
        $this->studentService->updateProfile($request->validated(), Auth::user()->id);

        return redirect()->back()->with('success', 'Profile updated successfully');
    }
}
