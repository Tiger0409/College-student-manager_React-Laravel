<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\CourseGroup;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class CourseGroupController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(CourseGroup::all()));
    }

    public function update(Request $request)
    {
        $params = $request->all();
        if (CourseGroup::updateCollection($params['data'])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getList(Request $request)
    {

        $courseGroups = CourseGroup::orderBy('name')->get();
        $output = [];
        foreach ($courseGroups as $group) {
            $output[] = [
                'value' => $group->id,
                'label' => $group->name
            ];
        }

        return response()->json($output);
    }


    public function swapGroups(Request $request)
    {
        list($groupDataA, $groupDataB) = array_values($request->all());
        $groupA = CourseGroup::find($groupDataA['id']);
        $groupB = CourseGroup::find($groupDataB['id']);

        if (CourseGroup::swap($groupA, $groupB))
            return response()->json();
        else
            return response()->json('Invalid id/id\'ds', 400);
    }
}
