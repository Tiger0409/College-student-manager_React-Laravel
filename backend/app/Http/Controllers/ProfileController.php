<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Profile;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    public function getEnumValues($enumType)
    {
        return DataFormatter::formatEnumValues(Profile::getEnumValues($enumType));
    }
}
