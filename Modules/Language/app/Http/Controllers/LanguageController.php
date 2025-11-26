<?php

namespace Modules\Language\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Modules\Language\Services\LanguageService;
use Modules\Language\Http\Requests\StoreLanguageRequest;
use Modules\Language\Http\Requests\UpdateLanguageRequest;
use Modules\Language\Models\Language;
use Modules\Language\Models\LanguageProperty;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function __construct(
        public LanguageService $languageService
    ) {}

    public function index()
    {
        $langs = Language::orderBy('is_default', 'desc')->get();

        return Inertia::render('dashboard/settings/translation/index', compact('langs'));
    }

    public function store(StoreLanguageRequest $request)
    {
        $this->languageService->storeLanguage($request->validated());

        return back()->with('success', "New language added successfully");
    }

    public function update(UpdateLanguageRequest $request, string $id)
    {
        $this->languageService->updateLanguage($id, $request->validated());

        return back()->with('success', "Language updated successfully");
    }

    public function edit(string $local)
    {
        $language = Language::where('code', $local)->with(['properties'])->firstOrFail();

        return Inertia::render('dashboard/settings/translation/update', compact('local', 'language'));
    }

    public function edit_property(string $id)
    {
        $property = LanguageProperty::where('id', $id)->with(['language:id,code'])->firstOrFail();

        return Inertia::render('dashboard/settings/translation/properties', compact('property'));
    }

    public function update_property(Request $request, $id)
    {
        $property = LanguageProperty::findOrFail($id);
        $property->update(['properties' => $request->all()]);

        return back()->with('success', $property->name . ' translation successfully updated');
    }

    public function change_direction(Request $request)
    {
        $cookie = Cookie::forever('direction', $request->direction);

        return back()->withCookie($cookie);
    }

    public function change_lang(Request $request)
    {
        $data = $request->validate([
            'locale' => ['required', 'string'],
            'direction' => ['nullable', 'in:ltr,rtl'],
        ]);

        Cache::forget($this->languageService->cacheKey);

        $direction = $data['direction'] ?? null;
        $normalizedLocale = strtolower($data['locale']);
        $rtlLocales = ['ar', 'arc', 'az', 'dv', 'fa', 'he', 'iw', 'ji', 'ku', 'ps', 'ur', 'yi'];
        $language = null;

        if (!$direction) {
            $language = Language::where('code', $data['locale'])->first();
            $direction = $language?->direction;
        }

        if (!$direction || $direction === 'auto') {
            $direction = in_array($normalizedLocale, $rtlLocales, true) ? 'rtl' : 'ltr';
        }

        if ($direction !== 'rtl' && in_array($normalizedLocale, $rtlLocales, true)) {
            $direction = 'rtl';
        }

        if (!in_array($direction, ['ltr', 'rtl'], true)) {
            $direction = 'ltr';
        }

        // Queue both cookies (Laravel will handle them properly)
        $lifetime = 60 * 24 * 365; // minutes in a year
        Cookie::queue('locale', $data['locale'], $lifetime);
        Cookie::queue('direction', $direction, $lifetime);

        return back();
    }

    public function default(Request $request, $id)
    {
        $this->languageService->defaultLanguage($id);

        return back()->with('success', "Default language set successfully");
    }

    public function status(Request $request, $local)
    {
        $langFilePath = base_path("lang/$local/active.txt");
        if (is_file($langFilePath)) {
            unlink($langFilePath);
        } else {
            file_put_contents($langFilePath, true);
        }

        return back();
    }
}
