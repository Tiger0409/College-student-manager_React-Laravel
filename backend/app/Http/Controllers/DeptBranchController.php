<?php

namespace App\Http\Controllers;

use App\Models\BranchAssociated;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class DeptBranchController extends Controller
{
    public function getList(Request $request)
    {
        $params = $request->all();
        $query = BranchAssociated::query();
        if (isset($params['cityId']))
            $query->where('city_id', $params['cityId']);
        $models = $query->get(['id', 'branch_name']);

        $output = [];
        foreach ($models as $model)
            $output[] = ['label' => $model->branchName, 'value' => $model->id];
        return response()->json($output);
    }
}
