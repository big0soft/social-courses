<?php

namespace App\Http\Controllers;

use App\Models\SalesPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesPointController extends Controller
{
    /**
     * Display public listing of approved sales points
     */
    public function index(Request $request)
    {
        $query = SalesPoint::approved();

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by region
        if ($request->filled('region')) {
            $query->byRegion($request->region);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->byCity($request->city);
        }

        $salesPoints = $query->orderBy('name')
            ->get();

        // Get unique regions and cities for filters
        $regions = SalesPoint::approved()
            ->select('region')
            ->whereNotNull('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region');

        $cities = SalesPoint::approved()
            ->select('city')
            ->whereNotNull('city')
            ->distinct()
            ->orderBy('city')
            ->pluck('city');

        // Prepare data for Google Maps
        $mapMarkers = $salesPoints->filter(function ($point) {
            return $point->hasCoordinates();
        })->map(function ($point) {
            return [
                'id' => $point->id,
                'name' => $point->name,
                'address' => $point->address,
                'phone' => $point->phone,
                'lat' => (float) $point->latitude,
                'lng' => (float) $point->longitude,
            ];
        })->values();

        $filters = [
            'search' => $request->search,
            'region' => $request->region,
            'city' => $request->city,
        ];

        // Generate meta tags for SEO
        $system = app('system_settings');
        $siteName = $system->fields['name'] ?? 'Beta E-Learning';
        $pageTitle = 'Sales Points - Find Prepaid Card Vendors | ' . $siteName;
        $pageDescription = 'Find authorized sales points and bookstores where you can purchase Beta E-Learning prepaid cards. ' . $salesPoints->count() . ' locations available.';

        return Inertia::render('sales-points/index', [
            'salesPoints' => $salesPoints,
            'mapMarkers' => $mapMarkers,
            'regions' => $regions,
            'cities' => $cities,
            'googleMapsApiKey' => config('services.google_maps.api_key'),
            'filters' => $filters,
        ])->withViewData([
            'metaTitle' => $pageTitle,
            'metaDescription' => $pageDescription,
            'ogTitle' => 'Sales Points - ' . $siteName,
            'ogDescription' => $pageDescription,
        ]);
    }

    /**
     * Display the specified sales point
     */
    public function show(string $id)
    {
        $salesPoint = SalesPoint::approved()->findOrFail($id);

        // Generate meta tags
        $system = app('system_settings');
        $siteName = $system->fields['name'] ?? 'Beta E-Learning';
        $pageTitle = $salesPoint->name . ' - Sales Point | ' . $siteName;
        $pageDescription = $salesPoint->description ?? ($salesPoint->name . ' - ' . $salesPoint->address . '. Phone: ' . $salesPoint->phone);

        return Inertia::render('sales-points/show', [
            'salesPoint' => $salesPoint,
            'googleMapsApiKey' => config('services.google_maps.api_key'),
        ])->withViewData([
            'metaTitle' => $pageTitle,
            'metaDescription' => $pageDescription,
            'ogTitle' => $salesPoint->name,
            'ogDescription' => $pageDescription,
        ]);
    }

    /**
     * API endpoint to get sales points as JSON (for map integration)
     */
    public function api(Request $request)
    {
        $query = SalesPoint::approved();

        // Filter by region
        if ($request->filled('region')) {
            $query->byRegion($request->region);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->byCity($request->city);
        }

        // Filter by bounds (for map viewport)
        if ($request->filled('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('latitude', [$bounds['south'], $bounds['north']])
                ->whereBetween('longitude', [$bounds['west'], $bounds['east']]);
        }

        $salesPoints = $query->get()->map(function ($point) {
            return [
                'id' => $point->id,
                'name' => $point->name,
                'address' => $point->address,
                'region' => $point->region,
                'city' => $point->city,
                'phone' => $point->phone,
                'email' => $point->email,
                'website' => $point->website,
                'description' => $point->description,
                'latitude' => $point->latitude,
                'longitude' => $point->longitude,
                'google_maps_url' => $point->getGoogleMapsUrl(),
                'callable_phone' => $point->getCallablePhone(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $salesPoints,
        ]);
    }
}
