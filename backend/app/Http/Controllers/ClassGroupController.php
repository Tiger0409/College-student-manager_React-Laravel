<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\CourseClassGroup;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ClassGroupController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getList(Request $request)
    {

        $classGroups = CourseClassGroup::orderBy('name')->get();
        $output = [];
        foreach ($classGroups as $group) {
            $output[] = [
                'value' => $group->id,
                'label' => $group->name
            ];
        }

        return response()->json($output);
    }

    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(CourseClassGroup::all()));
    }

    public function update(Request $request)
    {
        $params = $request->all();
        if (CourseClassGroup::updateCollection($params['data'])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }
}
