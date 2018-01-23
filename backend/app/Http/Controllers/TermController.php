<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\Log;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Term;

class TermController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(DataFormatter::printModels(Term::all(), $request->all()));
    }

    public function delete(Request $request)
    {
        $this->deleteModels(Term::className(), $request->all());
    }

    public function get($id)
    {
        $model = Term::find($id);
        if (!$model) {
            return response()->json('Model not found', 404);
        }

        return $model->asArray([], true);
    }

    public function edit(Request $request, $id)
    {
        $afterEdit = function ($model) {
            Log::write(Log::ACTION_UPDATE, LOG::MODULE_TERM, $model->id);
        };

        return $this->editModel(Term::className(), $request->all(), $id, [], $afterEdit);
    }

    public function create(Request $request)
    {
        $afterCreate = function ($model) {
            Log::write(Log::ACTION_CREATE, LOG::MODULE_TERM, $model->id);
        };

        $this->createModel(Term::className(), $request->all(), $afterCreate);
    }

    public function getList(Request $request)
    {
        /**
         * @var Term[] $terms
         */
        $terms = Term::orderBy('year', 'ASC')
            ->orderBy('term', 'ASC')
            ->get();

        $activeTermId = Term::activeTerm()->id;

        if ($request->ajax()) {
            $jsonTerms = [];
            foreach ($terms as $term) {
                $jsonTerms[] = [
                    'label'    => $term->name,
                    'value'    => $term->id,
                    'isActive' => $term->id == $activeTermId
                ];
            }

            return response()->json($jsonTerms);
        }
    }

    public function getActive()
    {
        return response()->json(Term::activeTerm());
    }

    public function setActive(Request $request)
    {
        $input = $request->all();
        if (!isset($input['id'])) {
            return response()->json('Term was not selected', 400);
        }

        Term::setActiveTerm($input['id']);
    }

    public function getFrontendActiveTerms()
    {
        $branches = $this->website->branchesAssociated;

        $termIds = [];
        $terms = [];
        foreach ($branches as $branch) {
            foreach ($branch->terms->toArray() as $branchTerm) {
                if (!in_array($branchTerm['id'], $termIds)) {
                    $terms[] = $branchTerm;
                    $termIds[] = $branchTerm['id'];
                }
            }
        }

        return $terms;
    }
}
