<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@beta-elearning.com',
            'password' => Hash::make('password'),
            'role' => UserType::ADMIN->value,
            'status' => 1,
            'email_verified_at' => now(),
        ]);

        // Create Instructors/Teachers
        $instructors = [
            [
                'name' => 'Ahmed Hassan',
                'email' => 'ahmed.hassan@beta-elearning.com',
                'designation' => 'Mathematics Teacher',
                'biography' => 'Experienced mathematics teacher with over 10 years of experience in teaching advanced mathematics and calculus.',
                'skills' => ['Mathematics', 'Calculus', 'Algebra', 'Geometry'],
            ],
            [
                'name' => 'Fatima Ali',
                'email' => 'fatima.ali@beta-elearning.com',
                'designation' => 'Physics Teacher',
                'biography' => 'Physics educator specializing in mechanics, thermodynamics, and modern physics.',
                'skills' => ['Physics', 'Mechanics', 'Thermodynamics', 'Quantum Physics'],
            ],
            [
                'name' => 'Omar Khalil',
                'email' => 'omar.khalil@beta-elearning.com',
                'designation' => 'Chemistry Teacher',
                'biography' => 'Chemistry expert with a passion for organic chemistry and laboratory experiments.',
                'skills' => ['Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Lab Techniques'],
            ],
            [
                'name' => 'Layla Mohammed',
                'email' => 'layla.mohammed@beta-elearning.com',
                'designation' => 'English Language Teacher',
                'biography' => 'English language specialist focusing on grammar, literature, and communication skills.',
                'skills' => ['English Language', 'Grammar', 'Literature', 'Communication'],
            ],
            [
                'name' => 'Karim Abdullah',
                'email' => 'karim.abdullah@beta-elearning.com',
                'designation' => 'Computer Science Teacher',
                'biography' => 'Software engineer and educator teaching programming and computer science fundamentals.',
                'skills' => ['Programming', 'Web Development', 'Algorithms', 'Database Design'],
            ],
        ];

        foreach ($instructors as $instructorData) {
            // Create user for instructor
            $user = User::create([
                'name' => $instructorData['name'],
                'email' => $instructorData['email'],
                'password' => Hash::make('password'),
                'role' => UserType::INSTRUCTOR->value,
                'status' => 1,
                'email_verified_at' => now(),
            ]);

            // Create instructor profile
            $instructor = Instructor::create([
                'user_id' => $user->id,
                'designation' => $instructorData['designation'],
                'biography' => $instructorData['biography'],
                'skills' => $instructorData['skills'],
                'resume' => 'resume.pdf',
                'status' => 'approved',
                'payout_methods' => [
                    [
                        'type' => 'payout',
                        'sub_type' => 'paypal',
                        'title' => 'Paypal Settings',
                        'fields' => [
                            'active' => false,
                            'test_mode' => false,
                            'currency' => 'USD',
                            'sandbox_client_id' => '',
                            'sandbox_secret_key' => '',
                            'production_client_id' => '',
                            'production_secret_key' => '',
                        ],
                    ],
                ],
            ]);

            // Link instructor to user
            $user->update(['instructor_id' => $instructor->id]);
        }

        // Create Students
        $students = [
            [
                'name' => 'Sara Ibrahim',
                'email' => 'sara.ibrahim@student.com',
            ],
            [
                'name' => 'Ali Hassan',
                'email' => 'ali.hassan@student.com',
            ],
            [
                'name' => 'Noor Faisal',
                'email' => 'noor.faisal@student.com',
            ],
            [
                'name' => 'Yusuf Mahmoud',
                'email' => 'yusuf.mahmoud@student.com',
            ],
            [
                'name' => 'Huda Rashid',
                'email' => 'huda.rashid@student.com',
            ],
            [
                'name' => 'Mohammad Salem',
                'email' => 'mohammad.salem@student.com',
            ],
            [
                'name' => 'Amina Tariq',
                'email' => 'amina.tariq@student.com',
            ],
            [
                'name' => 'Zainab Nasser',
                'email' => 'zainab.nasser@student.com',
            ],
            [
                'name' => 'Mustafa Karim',
                'email' => 'mustafa.karim@student.com',
            ],
            [
                'name' => 'Maryam Youssef',
                'email' => 'maryam.youssef@student.com',
            ],
        ];

        foreach ($students as $studentData) {
            User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password'),
                'role' => UserType::STUDENT->value,
                'status' => 1,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('✓ Created 1 Admin');
        $this->command->info('✓ Created 5 Instructors (Teachers)');
        $this->command->info('✓ Created 10 Students');
        $this->command->info('');
        $this->command->info('Default password for all users: password');
    }
}
