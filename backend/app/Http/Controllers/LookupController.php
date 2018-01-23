<?php

namespace App\Http\Controllers;

use App\Models\Lookup;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class LookupController extends Controller
{
    public function getItems(Request $request, $itemType)
    {
        return Lookup::getItems($itemType);
    }
}
