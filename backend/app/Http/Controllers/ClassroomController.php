<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Symfony\Component\Routing\Tests\Fixtures\RedirectableUrlMatcher;

class ClassroomController extends Controller
{
    /**
     * @param Request $request
     * @return array|JsonResponse
     */
    public function index(Request $request)
    {
        $input = $request->all();
        $fields = $input['fields'];
        $query = Classroom::query();

        if (!empty($input['branchId'])) {
            $query->where('branch_id', $input['branchId']);
        }

        return DataFormatter::modelsFieldsToArray($query->get(), $fields);
    }

    public function create(Request $request)
    {
        $model = new Classroom();
        $model->loadInput($request->all());
        $model->save();
        return response()->json($model->asArray());
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getList(Request $request)
    {
        $query = Classroom::orderBy('classroom_name');

        if ($request->has('branchId')) {
            $query->where('branch_id', $request->get('branchId'));
        }

        $classrooms = $query->get(['id', 'classroom_name']);
        $output = [];
        foreach ($classrooms as $classroom) {
            $output[] = [
                'value' => $classroom->id,
                'label' => $classroom->classroomName
            ];
        }

        return response()->json($output);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            Classroom::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(Classroom::find($id), $request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse|null
     */
    public function edit(Request $request, $id)
    {
        if ($model = Classroom::find($id)) {
            $model->loadInput($request->all());
            $model->save();
            return response()->json($model->asArray());
        }
        return null;
    }
}
