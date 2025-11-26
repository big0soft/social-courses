# 🔄 Force Complete Cache Refresh

## The Issue
Ziggy (the route helper) is using an old cached version of routes. Your browser and Vite are also caching old route definitions.

---

## ✅ Complete Refresh Steps

Run these commands **IN ORDER**:

### Step 1: Clear ALL Laravel Caches
```powershell
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Step 2: Stop Vite Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running

### Step 3: Clear Node/Browser Cache
```powershell
# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite

# (Optional) Clear all npm cache
npm cache clean --force
```

### Step 4: Restart Vite
```powershell
npm run dev
```

### Step 5: Hard Refresh Browser
- Open your browser
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or: `Ctrl+F5`
- Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

---

## 🧪 Verify Routes Exist

After clearing caches, verify the routes are registered:

```powershell
php artisan route:list | findstr "sales-points"
```

You should see output like:
```
GET|HEAD   dashboard/sales-points ................. sales-points.index
GET|HEAD   dashboard/sales-points/create .......... sales-points.create
POST       dashboard/sales-points ................. sales-points.store
GET|HEAD   dashboard/sales-points/{sales_point} ... sales-points.show
GET|HEAD   dashboard/sales-points/{sales_point}/edit sales-points.edit
PUT|PATCH  dashboard/sales-points/{sales_point} ... sales-points.update
DELETE     dashboard/sales-points/{sales_point} ... sales-points.destroy
```

---

## 🔍 If Still Not Working

### Check Route Registration
```powershell
# See ALL routes
php artisan route:list

# Search for prepaid-cards routes
php artisan route:list | findstr "prepaid-cards"

# Search for card redemption routes
php artisan route:list | findstr "card.redeem"
```

### Regenerate Route Cache (for production)
```powershell
# Only if you want to cache routes
php artisan route:cache
```

**Note:** During development, it's better to NOT cache routes so changes are picked up immediately.

---

## 📱 Browser-Specific Cache Clear

### Chrome/Edge:
1. F12 → Network tab
2. Check "Disable cache"
3. Keep DevTools open while testing

### Firefox:
1. F12 → Settings (gear icon)
2. Check "Disable HTTP Cache"

---

## 🎯 The Root Cause

Ziggy generates a JavaScript file with all Laravel route names. This file can get cached in:
- Laravel's cache
- Vite's build cache
- Browser cache
- Node modules cache

That's why we need to clear ALL of them!

---

## ✅ Quick Checklist

- [ ] Cleared all Laravel caches
- [ ] Stopped Vite dev server
- [ ] Cleared Vite cache folder
- [ ] Restarted Vite dev server
- [ ] Hard refreshed browser
- [ ] Verified routes with `php artisan route:list`
- [ ] Checked browser DevTools shows no cache

---

**After these steps, ALL routes should work!** 🎉
