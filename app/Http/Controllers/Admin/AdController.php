<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdRequest;
use App\Models\Ad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdController extends Controller
{
    public function index(): Response
    {
        $ads = Ad::orderBy('display_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('dashboard/ads/index', [
            'ads' => $ads,
        ]);
    }

    public function store(AdRequest $request): RedirectResponse
    {
        $data = $this->preparePayload($request);

        Ad::create($data);

        return redirect()->route('ads.index')->with('success', __('dashboard.ad_created_successfully'));
    }

    public function update(AdRequest $request, Ad $ad): RedirectResponse
    {
        $data = $this->preparePayload($request, $ad);

        $ad->update($data);

        return redirect()->route('ads.index')->with('success', __('dashboard.ad_updated_successfully'));
    }

    public function destroy(Ad $ad): RedirectResponse
    {
        $this->deleteStoredImage($ad->image);
        $ad->delete();

        return redirect()->route('ads.index')->with('success', __('dashboard.ad_deleted_successfully'));
    }

    protected function preparePayload(AdRequest $request, ?Ad $ad = null): array
    {
        $data = $request->validated();

        $data['is_active'] = (bool) ($data['is_active'] ?? false);
        $data['starts_at'] = blank($data['starts_at'] ?? null) ? null : $data['starts_at'];
        $data['ends_at'] = blank($data['ends_at'] ?? null) ? null : $data['ends_at'];

        if ($request->hasFile('image_file')) {
            if ($ad) {
                $this->deleteStoredImage($ad->image);
            }

            $data['image'] = $this->storeImage($request->file('image_file'));
        }

        unset($data['image_file']);

        return $data;
    }

    protected function storeImage(UploadedFile $file): string
    {
        $path = $file->store('ads', 'public');

        return Storage::url($path);
    }

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

