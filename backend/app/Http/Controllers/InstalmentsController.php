<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Instalment;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class InstalmentsController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(Instalment::all()));
    }

    public function update(Request $request)
    {
        $params = $request->all();
        if (Instalment::updateCollection($params['data'])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }
}
