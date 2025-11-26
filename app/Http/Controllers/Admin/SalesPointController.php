<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SalesPointController extends Controller
{
    /**
     * Display a listing of sales points
     */
    public function index(Request $request)
    {
        $query = SalesPoint::with('creator');

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by region
        if ($request->filled('region')) {
            $query->byRegion($request->region);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->byCity($request->city);
        }

        $salesPoints = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($request->query());

        $stats = [
            'total' => SalesPoint::count(),
            'approved' => SalesPoint::where('status', 'approved')->count(),
            'disabled' => SalesPoint::where('status', 'disabled')->count(),
        ];

        // Get unique regions and cities for filters
        $regions = SalesPoint::select('region')
            ->whereNotNull('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region');

        $cities = SalesPoint::select('city')
            ->whereNotNull('city')
            ->distinct()
            ->orderBy('city')
            ->pluck('city');

        $filters = [
            'search' => $request->search,
            'region' => $request->region,
            'city' => $request->city,
            'status' => $request->status,
        ];

        return Inertia::render('dashboard/sales-points/index', compact('salesPoints', 'stats', 'regions', 'cities', 'filters'));
    }

    /**
     * Show the form for creating a new sales point
     */
    public function create()
    {
        $regions = SalesPoint::select('region')->whereNotNull('region')->distinct()->orderBy('region')->pluck('region');
        $cities = SalesPoint::select('city')->whereNotNull('city')->distinct()->orderBy('city')->pluck('city');

        return Inertia::render('dashboard/sales-points/form', compact('regions', 'cities'));
    }

    /**
     * Store a newly created sales point
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'status' => 'required|in:approved,disabled',
            'notes' => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = Auth::id();

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeImage($request->file('image'));
        } else {
            unset($validated['image']);
        }

        // If no coordinates provided, try to geocode the address
        if (empty($validated['latitude']) || empty($validated['longitude'])) {
            if (config('services.google_maps.api_key')) {
                try {
                    $coordinates = $this->geocodeAddress($validated['address']);
                    if ($coordinates) {
                        $validated['latitude'] = $coordinates['lat'];
                        $validated['longitude'] = $coordinates['lng'];
                    }
                } catch (\Exception $e) {
                    \Log::warning('Geocoding failed', ['error' => $e->getMessage()]);
                }
            }
        }

        SalesPoint::create($validated);

        return redirect()->route('sales-points.index')
            ->with('success', 'Sales point created successfully');
    }

    /**
     * Display the specified sales point
     */
    public function show(string $id)
    {
        $salesPoint = SalesPoint::with('creator')->findOrFail($id);

        return Inertia::render('dashboard/sales-points/show', compact('salesPoint'));
    }

    /**
     * Show the form for editing the specified sales point
     */
    public function edit(string $id)
    {
        $salesPoint = SalesPoint::findOrFail($id);
        $regions = SalesPoint::select('region')->whereNotNull('region')->distinct()->orderBy('region')->pluck('region');
        $cities = SalesPoint::select('city')->whereNotNull('city')->distinct()->orderBy('city')->pluck('city');

        return Inertia::render('dashboard/sales-points/form', compact('salesPoint', 'regions', 'cities'));
    }

    /**
     * Update the specified sales point
     */
    public function update(Request $request, string $id)
    {
        $salesPoint = SalesPoint::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'status' => 'required|in:approved,disabled',
            'notes' => 'nullable|string|max:500',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($salesPoint->image) {
                $this->deleteStoredImage($salesPoint->image);
            }
            $validated['image'] = $this->storeImage($request->file('image'));
        } else {
            // Keep existing image if no new file uploaded
            unset($validated['image']);
        }

        // If coordinates are empty and address changed, try geocoding
        if ((empty($validated['latitude']) || empty($validated['longitude'])) && $validated['address'] !== $salesPoint->address) {
            if (config('services.google_maps.api_key')) {
                try {
                    $coordinates = $this->geocodeAddress($validated['address']);
                    if ($coordinates) {
                        $validated['latitude'] = $coordinates['lat'];
                        $validated['longitude'] = $coordinates['lng'];
                    }
                } catch (\Exception $e) {
                    \Log::warning('Geocoding failed', ['error' => $e->getMessage()]);
                }
            }
        }

        $salesPoint->update($validated);

        return redirect()->route('sales-points.index')
            ->with('success', 'Sales point updated successfully');
    }

    /**
     * Remove the specified sales point
     */
    public function destroy(string $id)
    {
        $salesPoint = SalesPoint::findOrFail($id);
        $salesPoint->delete();

        return redirect()->route('sales-points.index')
            ->with('success', 'Sales point deleted successfully');
    }

    /**
     * Geocode an address using Google Maps API
     */
    private function geocodeAddress(string $address): ?array
    {
        $apiKey = config('services.google_maps.api_key');

        if (!$apiKey) {
            return null;
        }

        $url = 'https://maps.googleapis.com/maps/api/geocode/json?' . http_build_query([
            'address' => $address,
            'key' => $apiKey,
        ]);

        // Create context with timeout to prevent hanging
        $context = stream_context_create([
            'http' => [
                'timeout' => 5, // 5 second timeout
                'ignore_errors' => true
            ]
        ]);

        $response = @file_get_contents($url, false, $context);

        if ($response === false) {
            \Log::warning('Geocoding request failed', ['address' => $address]);
            return null;
        }

        $data = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            \Log::warning('Geocoding JSON decode failed', ['error' => json_last_error_msg()]);
            return null;
        }

        if (isset($data['status']) && $data['status'] === 'OK' && !empty($data['results'])) {
            $location = $data['results'][0]['geometry']['location'];
            return [
                'lat' => (float) $location['lat'],
                'lng' => (float) $location['lng'],
            ];
        }

        return null;
    }

    /**
     * Store uploaded image and return the URL
     */
    protected function storeImage($file): string
    {
        $path = $file->store('sales-points', 'public');
        return Storage::url($path);
    }

    /**
     * Delete stored image file
     */
    protected function deleteStoredImage(?string $image): void
    {
        if (!$image || !Str::startsWith($image, '/storage/')) {
            return;
        }

        $relativePath = Str::after($image, '/storage/');

        if ($relativePath) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
