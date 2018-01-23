<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\ExtendedModel;
use App\Models\Log;
use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class WebsiteController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(Website::all()));
    }

    public function create(Request $request)
    {
        $afterCreate = function (ExtendedModel $model) {
            Log::write(Log::ACTION_CREATE, Log::MODULE_WEBSITE, $model->getKey());
        };

        return $this->createModel(Website::className(), $request->all(), $afterCreate);
    }

    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {

            $models = Website::whereIn('id', $params['ids'])->get();

            foreach ($models as $model) {
                if (count($model->branchesAssociated) > 0) {
                    return response()->json('Error. Some of the branches used.', 400);
                }
            }

            Website::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }

        return response()->json('None of id was selected', 400);
    }

    public function get(Request $request, $id)
    {
        $model = Website::find($id);
        if (!$model) {
            return response()->json('Model was not found', 404);
        }

        $params = $request->all();
        $fields = isset($params['fields']) ? $params['fields'] : [];
        return response()->json($model->fieldsToArray($fields));
    }

    public function edit(Request $request, $id)
    {
        return $this->editModel(Website::className(), $request->all(), $id, ['saveRelations' => true]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getList(Request $request)
    {
        $models = Website::all(['id', 'name']);

        $output = [];
        foreach ($models as $model) {
            $output[] = [
                'label' => $model->name,
                'value' => $model->id
            ];
        }

        return response()->json($output);
    }

    /**
     * @return JsonResponse
     */
    public function getHeader()
    {
        return response()->json($this->website->header);
    }

    /**
     * @return JsonResponse
     */
    public function getFooter()
    {
        return response()->json($this->website->footer);
    }

    public function getFolder()
    {
        return response()->json($this->website->folder);
    }

    public function getToc()
    {
        return response()->json($this->website->toc, 200);
    }

    public function getCurrent()
    {
        $fields = [
            'id',
            'folder',
            'header',
            'footer',
            'toc',
            'name',
            'activeTermId',
            'branchesAssociated',
            'paymentHeading',
            'paymentField1',
            'paymentField2',
            'PayPal'
        ];
        return response()->json($this->website->fieldsToArray($fields));
    }


    public function detachBranch($id, $branchId)
    {
        /**
         * @var Website $model
         */
        $model = Website::find($id);
        if (!$model) {
            return response()->json('Model was not found', 404);
        }

        $ids = explode('_', $model->branch_id);
        for ($i = 0; $i < count($ids); $i++) {
            if ($ids[$i] == $branchId) {
                unset($ids[$i]);
                break;
            }
        }

        $model->branchesAssociated = $ids;
        $model->save();
    }
}
