<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdResource;
use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Display a listing of active ads.
     */
    public function index(Request $request)
    {
        $ads = Ad::active()
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return AdResource::collection($ads);
    }
}

