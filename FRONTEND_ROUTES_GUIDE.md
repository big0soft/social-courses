# Frontend Routes Guide - How to Access the New Pages

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Start your Laravel server:**
   ```bash
   php artisan serve
   ```

3. **Visit:** http://localhost:8000 (or your configured URL)

---

## 📍 Page Routes

### Admin - Prepaid Cards

| Page | Route | File Location |
|------|-------|---------------|
| **Card Generation** | `/dashboard/prepaid-cards/create` | `resources/js/pages/dashboard/prepaid-cards/create.tsx` |
| **Card Management** | `/dashboard/prepaid-cards` | `resources/js/pages/dashboard/prepaid-cards/index.tsx` |
| **Card Statistics** | `/dashboard/prepaid-cards/statistics` | `resources/js/pages/dashboard/prepaid-cards/statistics.tsx` |

**How to access:**
1. Login as admin
2. Navigate to: http://localhost:8000/dashboard/prepaid-cards

---

### Admin - Sales Points

| Page | Route | File Location |
|------|-------|---------------|
| **Sales Points List** | `/dashboard/sales-points` | `resources/js/pages/dashboard/sales-points/index.tsx` |
| **Create Sales Point** | `/dashboard/sales-points/create` | `resources/js/pages/dashboard/sales-points/form.tsx` |
| **Edit Sales Point** | `/dashboard/sales-points/{id}/edit` | `resources/js/pages/dashboard/sales-points/form.tsx` |

**How to access:**
1. Login as admin
2. Navigate to: http://localhost:8000/dashboard/sales-points

---

### Student - Card Redemption

| Page | Route | File Location |
|------|-------|---------------|
| **Card Redemption** | `/card/redeem` | `resources/js/pages/student/card-redemption/index.tsx` |

**How to access:**
1. Login as student
2. Navigate to: http://localhost:8000/card/redeem

---

### Public - Sales Points

| Page | Route | File Location |
|------|-------|---------------|
| **Sales Points Map** | `/sales-points` | `resources/js/pages/sales-points/index.tsx` |

**How to access:**
- Visit: http://localhost:8000/sales-points (no login required)

---

## 🔧 Troubleshooting

### "Page not found" or "404 error"

The backend controllers need to return these Inertia pages. Let me check if the controllers are properly configured...

### Check Controller Methods

Each controller should use `Inertia::render()` like this:

```php
// Example from PrepaidCardController
public function create()
{
    return Inertia::render('dashboard/prepaid-cards/create', [
        'courses' => Course::all(['id', 'title', 'price']),
        'cardTypes' => [
            ['value' => 'single_course', 'label' => 'Single Course'],
            ['value' => 'bundle', 'label' => 'Bundle'],
        ],
    ]);
}
```

### Verify Routes are Registered

Check that routes are added in:
- `routes/admin.php` for admin pages
- `routes/web.php` for student and public pages

### Component Path Format

Inertia component paths should use **forward slashes** and **no file extension**:
- ✅ Correct: `'dashboard/prepaid-cards/create'`
- ❌ Wrong: `'dashboard.prepaid-cards.create'`
- ❌ Wrong: `'dashboard/prepaid-cards/create.tsx'`

---

## 🎨 What Each Page Does

### 1. Card Generation (`/dashboard/prepaid-cards/create`)
- Create single course or bundle cards
- Bulk generation (up to 1000 cards)
- Set price, currency, expiration
- Add admin notes

### 2. Card Management (`/dashboard/prepaid-cards`)
- View all cards with statistics
- Filter by status, type, batch
- Export to CSV
- Edit/delete cards

### 3. Card Statistics (`/dashboard/prepaid-cards/statistics`)
- View activation trends
- See revenue metrics
- Analyze card distribution
- Recent activations list

### 4. Sales Points Admin (`/dashboard/sales-points`)
- Manage all sales points
- Filter by region/city
- View on map
- Approve/disable locations

### 5. Card Redemption (`/card/redeem`)
- Students enter card code
- Validate before activation
- View redemption history
- Auto-enroll in courses

### 6. Public Sales Points (`/sales-points`)
- Google Maps with markers
- Toggle map/list view
- Search by location
- Get directions

---

## 🐛 Common Issues

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: Vite not compiling
**Solution:**
```bash
npm run build
# or
npm run dev
```

### Issue: Pages show but no styling
**Solution:** Ensure Vite dev server is running (`npm run dev`)

### Issue: Google Maps not showing
**Solution:** Add to `.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## ✅ Quick Verification Checklist

- [ ] `npm run dev` is running (Vite server)
- [ ] `php artisan serve` is running (Laravel server)
- [ ] Logged in as appropriate user role
- [ ] Routes are defined in `routes/admin.php` or `routes/web.php`
- [ ] Controllers return `Inertia::render()` with correct component paths
- [ ] `.env` has Google Maps API key (for sales points page)

---

**Need Help?** Check the controller files to ensure they're using the correct Inertia component paths!
