<?php
/**
 * Created by PhpStorm.
 * User: dev54
 * Date: 22.04.16
 * Time: 12:40
 */

namespace App\Http\Controllers;


use App\Classes\Helpers\DataFormatter;
use App\Models\BranchAssociated;
use App\Models\Log;
use App\Models\Role;
use App\Models\User;
use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BranchesAssociatedController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(BranchAssociated::all(), null, true));
    }

    public function frontendList(Request $request)
    {
        return response()->json(DataFormatter::printModels(BranchAssociated::all(), $request->all()));
    }

    public function get($id)
    {
        /** @var BranchAssociated $model */
        $model = BranchAssociated::find($id);
        if (!$model) {
            return response()->json('Model was not found', 404);
        }

        return $model->asArray(null, true);
    }

    public function getList(Request $request)
    {
        $output = [];
        $query = BranchAssociated::query();

        /**
         * @var User $user
         */
        $user = Auth::user();

        if ($request->has('listedOnly') && $request->get('listedOnly') == 'true') {
            $query->where('is_listed', '1');
        }

        if ($request->has('allowedOnly') && $request->get('allowedOnly')) {
            switch ($user->userMainRole) {
                case Role::REGISTRAR:
                    $query->whereIn('id', explode('_', $user->allowedBranches));
                    break;
                case Role::ADMIN:
                case Role::SUPER_ADMIN:
                    break;
                default:
                    return response()->json('', 403);
            }
        }

        foreach ($query->get() as $model) {
            $output[] = ['label' => $model->branchName, 'value' => $model->id];
        }

        return $output;
    }

    public function create(Request $request)
    {
        $afterCreate = function ($model) {
            Log::write(Log::ACTION_CREATE, Log::MODULE_BRANCH, $model->id);
        };

        $this->createModel(BranchAssociated::className(), $request->all(), $afterCreate);
    }

    public function edit(Request $request, $id)
    {
        $afterEdit = function ($model) {
            Log::write(Log::ACTION_UPDATE, Log::MODULE_BRANCH, $model->id);
        };

        return $this->editModel(
            BranchAssociated::className(),
            $request->all(),
            $id,
            ['saveRelations' => true],
            $afterEdit
        );
    }

    public function delete(Request $request)
    {        
        $beforeDelete = function (BranchAssociated $model) {
            if (count($model->websites) > 0) {
                return 'Error. Branch is in use';
            }

            return true;
        };

        $afterDelete = function ($ids, $reason = '') {
            foreach ($ids as $id) {
                Log::write(Log::ACTION_DELETE, Log::MODULE_BRANCH, $id, $reason);
            }

            foreach (Website::all() as $website) {
                $branches = DataFormatter::modelsToArrays($website->branchesAssociated);
                for ($i = 0; $i < count($branches); $i++) {
                    foreach ($ids as $id) {
                        if ($branches[$i]['id'] == $id) {
                            array_splice($branches, $i, 1);
                            break;
                        }
                    }
                }
                $website->branchesAssociated = $branches;
                $website->save();
            }
        };

        return $this->deleteModels(BranchAssociated::className(), $request->all(), $beforeDelete, $afterDelete);
    }

    public function update(Request $request)
    {
        $params = $request->all();

        foreach ($params['data'] as $item) {
            /** @var BranchAssociated $branch */
            $branch = BranchAssociated::findOrFail($item['id']);

            $termsRelations = [];
            if (!empty($item['terms'])) {
                foreach ($item['terms'] as $term) {
                    $termsRelations[$term['id']] = ['website_id' => $this->website->id];
                }
            }

            $branch->terms()->sync($termsRelations);
        }

        if (BranchAssociated::updateCollection($params['data'], ['saveRelations' => true])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }
}