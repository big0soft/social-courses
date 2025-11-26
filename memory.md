# Project Memory - Design System & Common Patterns

## Design System Guidelines

### UI Component Library
- **Framework:** React + TypeScript + Inertia.js
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Icons:** Lucide React

### Component Patterns

#### Language Switcher
- **Component Location:** `resources/js/components/language.tsx`
- **Pattern:** Globe icon button with dropdown menu
- **Usage:** Check `system.fields.language_selector` before rendering
- **Styling:**
  - Button: `variant="secondary" size="icon"` with `h-9 w-9 rounded-full`
  - Icon: Globe from Lucide React at `!h-5 !w-5`
  - Dropdown: Aligned to the right, width `w-[160px]`
  - Active language: Shows Check icon next to current language

#### Layout System
- **Main Layout:** `resources/js/layouts/main.tsx` - Base wrapper with toast handling
- **Auth Layout:** `resources/js/layouts/auth-layout.tsx` - Minimal layout for login/register
- **Landing Layout:** `resources/js/layouts/landing-layout.tsx` - Public pages with navbar
- **Dashboard Layout:** `resources/js/layouts/dashboard-layout.tsx` - Authenticated area

### Language/Internationalization (i18n)

#### How It Works
- Languages are managed via `Modules/Language`
- Language selection stored as **cookies** (forever duration)
- Available languages: `props.langs` (array of Language objects with direction property)
- Current language: `props.locale` (string code)
- Text direction: `props.direction` ('ltr' | 'rtl')
- **RTL Support**: Each language has a `direction` field ('ltr' or 'rtl')
- Direction automatically switches when language changes

#### Routes
- Change language: `route('change.lang')` - POST with `{ locale: string }`
  - Automatically sets direction cookie based on language's direction property
- Change direction: `route('change.direction')` - POST with `{ direction: string }`
  - Manual direction toggle (only visible if `system.fields.direction === 'none'`)

#### Admin Setting
- Path: Dashboard Settings → System → Website → Additional Settings
- Setting: `system.fields.language_selector` (boolean)
- Default: `true` (show)

### Common Shared Data Structure

```typescript
interface SharedData {
  langs: Language[];              // All available languages
  locale: string;                 // Current language code
  direction: 'ltr' | 'rtl';       // Text direction
  system: {
    fields: {
      language_selector: boolean; // Show/hide language switcher
      // ... other system settings
    }
  };
  // ... other props
}
```

Access via: `const { props } = usePage<SharedData>();`

### Styling Conventions

#### Buttons
- Secondary variant: For less prominent actions (theme switcher, language selector)
- Icon size: Typically `h-9 w-9` for icon buttons
- Rounded: Use `rounded-full` for icon-only buttons

#### Spacing
- Gap between elements: Usually `gap-2` or `gap-4`
- Padding: `p-6` on mobile, `p-10` on desktop (md:)
- Max width for forms: `max-w-sm` (384px)

#### Colors
- Use Tailwind's semantic classes: `bg-background`, `text-muted-foreground`
- Don't hardcode colors

#### Typography
- Page titles: `text-2xl font-semibold`
- Descriptions: `text-muted-foreground text-sm`

### File Organization

#### Frontend Structure
```
resources/js/
├── components/          # Reusable components (language.tsx, etc.)
├── layouts/            # Layout wrappers
│   ├── auth-layout.tsx
│   ├── landing-layout.tsx
│   ├── dashboard-layout.tsx
│   └── navbar/
├── pages/              # Page components
│   ├── auth/          # Login, register, etc.
│   ├── dashboard/     # Admin pages
│   ├── courses/
│   └── blogs/
└── types/             # TypeScript definitions
    └── global.d.ts
```

#### Backend Structure (Modular)
```
Modules/
├── Language/
│   ├── app/Http/Controllers/
│   ├── routes/web.php
│   └── ...
└── [OtherModules]/
```

## Common Changes & Patterns

### Adding Components to Auth Pages
1. Import component in `auth-layout.tsx`
2. Position typically at top-right corner of card or above logo
3. Maintain minimal, centered design
4. Check if admin setting controls visibility (like `language_selector`)

### Adding Navbar Items
1. Main navbar: `resources/js/layouts/navbar/index.tsx`
2. Actions: `resources/js/layouts/navbar/partials/actions.tsx`
3. Pass props from parent layouts (e.g., `language={true}`)
4. Check admin settings before rendering

### Working with Inertia.js
- Use `usePage<SharedData>()` hook for accessing shared data
- Use `router.post()` for form submissions
- Use `route('route.name')` helper for generating URLs
- Use `Link` component for navigation

### TypeScript Best Practices
- Define props interfaces for all components
- Use `SharedData` interface from `types/global.d.ts`
- Extend types when needed, don't modify existing ones

## Browser Support
- Target: Modern browsers (ES6+)
- RTL support: Required for Arabic language
- Direction switching: Handled via cookie + page reload

## Performance Considerations
- Language cache: Cleared on language change
- Cookies: Used for persistent language/direction storage
- Toast notifications: Handled by Main layout (single instance)

## Testing Checklist
When adding new features:
- [ ] Test in both LTR and RTL modes
- [ ] Test with language switcher enabled and disabled
- [ ] Test on mobile and desktop viewports
- [ ] Verify TypeScript types are correct
- [ ] Check admin settings work correctly
- [ ] Verify authentication state handling

## Notes
- Logo component: `<AppLogo />` available throughout app
- Theme switcher: `<Appearance />` component
- Notifications: `<Notifications />` component (authenticated only)
- All auth pages should maintain a clean, minimal design
- Avoid adding unnecessary elements to auth pages

---

# Backend (PHP/Laravel) Security & Patterns

## CRITICAL Security Rules

### 1. Mass Assignment Protection
**ALWAYS protect sensitive fields from mass assignment:**

```php
// In ALL models - Good example (User.php)
protected $fillable = [
    'name',
    'email',
    'password',
    'photo',
    'google_id',
    'social_links',
];

protected $guarded = [
    'role',              // NEVER allow mass assignment
    'status',            // NEVER allow mass assignment
    'email_verified_at', // NEVER allow mass assignment
    'instructor_id',     // NEVER allow mass assignment
];
```

**Why:** Prevents privilege escalation attacks where users can become admins by adding `role=admin` to registration

### 2. Authorization Checks
**ALWAYS verify ownership before allowing access:**

```php
// BAD - IDOR vulnerability
public function show($id) {
    $resource = Resource::findOrFail($id);
    return view('show', compact('resource'));
}

// GOOD - Verify ownership
public function show($id) {
    $resource = Resource::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();
    return view('show', compact('resource'));
}

// BETTER - Use policies
public function show($id) {
    $resource = Resource::findOrFail($id);
    $this->authorize('view', $resource);
    return view('show', compact('resource'));
}
```

### 3. SQL Injection Prevention
**ALWAYS escape LIKE wildcards in search queries:**

```php
// BAD
public function scopeSearch($query, $search) {
    return $query->where('name', 'like', "%{$search}%");
}

// GOOD - Escape wildcards
public function scopeSearch($query, $search) {
    $escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);
    return $query->where('name', 'like', "%{$escapedSearch}%");
}
```

### 4. Input Validation
**ALWAYS validate ALL user input:**

```php
// GOOD validation example
$validated = $request->validate([
    'email' => 'required|email|max:255|unique:users',
    'password' => [
        'required',
        'confirmed',
        Rules\Password::min(8)
            ->mixedCase()
            ->numbers()
            ->symbols()
            ->uncompromised()
    ],
    'name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/',
]);
```

### 5. File Upload Security
**ALWAYS validate file type, size, and content:**

```php
$validated = $request->validate([
    'file' => [
        'required',
        'file',
        'mimes:pdf,jpg,png,mp4',
        'max:102400', // 100MB
    ],
]);

// Validate magic numbers (first bytes)
$file = $request->file('file');
$contents = file_get_contents($file->path());
$magicNumber = bin2hex(substr($contents, 0, 4));

// PDF should start with '%PDF'
if ($file->getMimeType() === 'application/pdf' && substr($contents, 0, 4) !== '%PDF') {
    throw new \Exception('Invalid PDF file');
}
```

### 6. Database Transactions
**ALWAYS wrap critical operations in transactions:**

```php
// GOOD - Race condition protected
public function redeem($code) {
    return DB::transaction(function () use ($code) {
        $card = PrepaidCard::where('code', $code)
            ->lockForUpdate()  // CRITICAL: Row-level lock
            ->firstOrFail();

        if (!$card->isValid()) {
            throw new \Exception('Card is not valid');
        }

        $card->markAsUsed(Auth::user());

        return ['success' => true, 'card' => $card];
    });
}
```

### 7. Rate Limiting
**ALWAYS add rate limiting to sensitive endpoints:**

```php
// In routes file
Route::post('card/validate', [CardController::class, 'validate'])
    ->middleware('throttle:10,1');  // 10 attempts per minute

// In controller - add IP-based tracking
$attempts = CardValidationAttempt::where('ip_address', $request->ip())
    ->where('created_at', '>=', now()->subMinutes(10))
    ->count();

if ($attempts > 20) {
    return response()->json(['error' => 'Too many attempts'], 429);
}
```

### 8. External API Calls
**ALWAYS add timeouts and error handling:**

```php
// BAD - No timeout
$response = file_get_contents($apiUrl);

// GOOD - With timeout and error handling
$context = stream_context_create([
    'http' => [
        'timeout' => 5,
        'ignore_errors' => true
    ]
]);

$response = @file_get_contents($apiUrl, false, $context);

if ($response === false) {
    \Log::warning('API request failed', ['url' => $apiUrl]);
    return null;
}

$data = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    \Log::warning('JSON decode failed', ['error' => json_last_error_msg()]);
    return null;
}
```

## Common Backend Patterns

### Controller Structure
```php
class ResourceController extends Controller
{
    public function __construct(
        protected ResourceService $service
    ) {}

    public function index(Request $request)
    {
        // 1. Get filters from request
        $filters = $request->only(['search', 'status', 'date']);

        // 2. Query with eager loading to prevent N+1
        $resources = Resource::with(['user', 'category'])
            ->when($filters['search'], fn($q) => $q->search($filters['search']))
            ->when($filters['status'], fn($q) => $q->where('status', $filters['status']))
            ->latest()
            ->paginate(20);

        // 3. Return Inertia response
        return Inertia::render('Resources/Index', [
            'resources' => $resources,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([...]);

        // 2. Authorize
        $this->authorize('create', Resource::class);

        // 3. Execute in transaction
        try {
            $resource = DB::transaction(function () use ($validated) {
                $resource = Resource::create($validated);
                // ... additional operations
                return $resource;
            });

            return redirect()
                ->route('resources.show', $resource)
                ->with('success', 'Resource created successfully');

        } catch (\Exception $e) {
            \Log::error('Resource creation failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to create resource')
                ->withInput();
        }
    }
}
```

### Model Best Practices
```php
class Resource extends Model
{
    // 1. Always define fillable/guarded
    protected $fillable = ['name', 'description', 'user_id'];
    protected $guarded = ['status', 'verified_at'];

    // 2. Cast attributes
    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
        'metadata' => 'array',
    ];

    // 3. Define relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 4. Add scopes for common queries
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // 5. Add business logic methods
    public function canBeEdited(): bool
    {
        return $this->status === 'draft' &&
               $this->user_id === Auth::id();
    }
}
```

### Validation Rules Reference
```php
// Common validation patterns
[
    'email' => 'required|email|max:255|unique:users,email',
    'password' => ['required', 'min:8', 'confirmed'],
    'price' => 'required|numeric|min:0|max:9999999.99',
    'quantity' => 'required|integer|min:1|max:1000',
    'url' => 'nullable|url|max:500',
    'date' => 'required|date|after:today',
    'status' => 'required|in:active,inactive,pending',
    'file' => 'required|file|mimes:pdf,jpg,png|max:10240', // 10MB
    'array_field' => 'required|array|min:1',
    'array_field.*' => 'exists:table,id',
]

// Custom validation
'field' => [
    'required',
    function ($attribute, $value, $fail) {
        if (!customValidation($value)) {
            $fail('The '.$attribute.' is invalid.');
        }
    }
]
```

## Performance Optimization

### 1. Avoid N+1 Queries
```php
// BAD - N+1 query problem
$courses = Course::all();
foreach ($courses as $course) {
    echo $course->instructor->name; // Query for each course
}

// GOOD - Eager loading
$courses = Course::with('instructor')->get();
```

### 2. Use Database Indexes
```sql
-- Add indexes for frequently queried columns
ALTER TABLE prepaid_cards ADD INDEX idx_code (code);
ALTER TABLE prepaid_cards ADD INDEX idx_status_expired (status, expires_at);
ALTER TABLE course_enrollments ADD INDEX idx_user_course (user_id, course_id);
```

### 3. Cache Expensive Queries
```php
$stats = Cache::remember('dashboard.stats', 3600, function () {
    return [
        'total_users' => User::count(),
        'active_courses' => Course::where('status', 'active')->count(),
        // ... other stats
    ];
});
```

## Testing Checklist

### Before Deploying:
- [ ] All routes have proper authentication middleware
- [ ] All admin routes have role:admin middleware
- [ ] All models have proper $fillable/$guarded
- [ ] All file uploads are validated (type, size, content)
- [ ] All sensitive operations use database transactions
- [ ] All search queries escape LIKE wildcards
- [ ] All external API calls have timeouts
- [ ] All user input is validated and sanitized
- [ ] No SQL injection vulnerabilities (use bindings)
- [ ] No XSS vulnerabilities (use {{ }} not {!! !!})
- [ ] Rate limiting on authentication endpoints
- [ ] Proper error messages (don't expose internals)
- [ ] CSRF protection enabled on all forms

## Common Vulnerabilities to Avoid

1. **IDOR (Insecure Direct Object References)**
   - Always verify resource ownership before access

2. **Mass Assignment**
   - Never allow `role`, `status`, `email_verified_at` in $fillable

3. **SQL Injection**
   - Always use parameterized queries
   - Escape LIKE wildcards

4. **XSS (Cross-Site Scripting)**
   - Use `{{ }}` not `{!! !!}` unless absolutely necessary
   - Sanitize rich text with HTMLPurifier

5. **Race Conditions**
   - Use database transactions with `lockForUpdate()`

6. **File Upload Vulnerabilities**
   - Validate MIME type and magic numbers
   - Store uploads outside webroot
   - Generate unique filenames

7. **Authentication Bypass**
   - Never trust client-side role checks
   - Always verify on server side

8. **Information Disclosure**
   - Don't expose exception messages to users
   - Don't log sensitive data (passwords, tokens)
