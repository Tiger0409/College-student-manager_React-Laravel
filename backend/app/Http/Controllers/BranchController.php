<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(DataFormatter::printModels(Branch::all(), $request->all()));
    }

    public function delete(Request $request) {
        $params = $request->all();
        if (isset($params['ids'])) {
            Website::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }

        return response()->json('None of id was selected', 400);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getList(Request $request)
    {
        $output = [];
        $branches = Branch::all(['id', 'name']);
        foreach ($branches as $branch) {
            $output[] = [
                'label' => $branch->name,
                'value' => $branch->id
            ];
        }

        return response()->json($output);
    }

    /**
     * @return JsonResponse
     */
    public function getWithAssociated()
    {
        /**
         * @var Branch $branch
         */
        $branches = Branch::orderBy('name')->with('branchesAssociated')->get();
        $result = [];
        foreach ($branches as $branch) {
            $result[] = [
                'value' => 'branch_' . $branch->id,
                'label' => $branch->name
            ];
            foreach ($branch->branchesAssociated as $childBranch) {
                $result[] = [
                    'value' => 'branchAssoc_' . $childBranch->id,
                    'label' => ' -' . $childBranch->branchName
                ];
            }
        }

        return response()->json($result);
    }

    public function getGroupedList()
    {
        $output = [];
        $branches = Branch::with('branchesAssociated')->get();
        foreach ($branches as $branch) {
            foreach ($branch->branchesAssociated as $branchAssoc) {
                $output[$branch->name][] = [
                    'value' => $branchAssoc->id,
                    'label' => $branchAssoc->branchName
                ];
            }
        }

        return response()->json($output);
    }
}
