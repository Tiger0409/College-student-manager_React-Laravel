<?php
/**
 * Created by PhpStorm.
 * User: dev54
 * Date: 20.04.16
 * Time: 12:20
 */

namespace App\Http\Controllers;


use App\Classes\Helpers\DataFormatter;
use App\Models\Bank;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(Bank::all()));
    }

    public function update(Request $request)
    {
        $params = $request->all();
        if (Bank::updateCollection($params['data'])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }
}