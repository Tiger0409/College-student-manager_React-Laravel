<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(DataFormatter::modelsToArrays(Page::all()));
    }

    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            Website::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }

        return response()->json('None of id was selected', 400);
    }
}