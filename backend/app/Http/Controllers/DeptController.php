<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Dept;
use App\Models\Log;
use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Http\JsonResponse;

class DeptController extends Controller
{
    /**
     * @param Request $request
     * @return array|JsonResponse
     */
    public function index(Request $request)
    {
        $input = $request->all();
        $query = Dept::orderBy('weight', 'DESC');

        if (!empty($input['branchId'])) {
            $query->where('dept_branch_id', $input['branchId']);
        }

        return DataFormatter::formatQueryResult($query, $request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(Dept::find($id), $request->all());
    }

    public function create(Request $request)
    {
        $model = new Dept();
        $model->loadInput($request->all());
        $model->save();
        return response()->json($model->asArray());
    }

    public function edit(Request $request, $id)
    {
        if ($model = Dept::find($id)) {
            $model->loadInput($request->all());
            $model->save();
            return response()->json($model->asArray());
        }
        return null;
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            Dept::whereIn('id', $params['ids'])
                ->has('courses', '=', 0)
                ->delete();
            return response()->json('', 204);
        }
    }

    /**
     * @param Request $request
     * @return \App\Models\Dept[]|JsonResponse
     */
    public function getList(Request $request)
    {
        /**
         * @var Dept[] $depts
         */

        $input = $request->all();
        $query = Dept::orderBy('dept_name', 'ASC')->with('branchAssociated');

        if (!empty($input['branchId']) && $input['branchId'] !== 'All') {
            $query->where('dept_branch_id', $input['branchId']);
        }

        $depts = $query->get();

        $output = [];

        foreach ($depts as $dept) {
            $name = $dept->deptName;

            if ($dept->branchAssociated)
                $name .= ' (' . $dept->branchAssociated->branchName . ')';

            $output[] = [
                'value'    => $dept->id,
                'label'    => $name,
                'branchId' => $dept->deptBranchId
            ];
        }

        return response()->json($output);
    }
}
