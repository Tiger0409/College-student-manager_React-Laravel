<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\ExtendedModel;
use App\Models\Role;
use App\Models\User;
use App\Models\Website;
use App\Models\Cart;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * folder for view templates
     * @var string
     */
    public $templatesDir;
    /**
     * selected website by id in website.php
     * @var Website
     */
    public $website;

    public function __construct()
    {
        $this->website = Website::find(config('website.id'));
        $this->templatesDir = $this->getTemplatesDir();
    }

    /**
     * Deprecated
     * @return string
     */
    private function getTemplatesDir()
    {
        /*if (Auth::check()) {

            $user = Auth::user();
            switch ($user->userMainRole) {
                case Role::SUPER_ADMIN:
                case Role::ADMIN:
                    return 'admin';
                case Role::REGISTRAR:
                    return 'registrar';
                case role::STUDENT:
                    return 'student/' . $this->website->folder;
            }
        }

        return 'student/' . $this->website->folder . '/front';*/
    }

    /**
     * @param string $action
     * @return string
     */
    public function getViewPath($action = '')
    {
        /*$calledClassName = get_called_class();
        $parts = explode('\\', $calledClassName);
        $classShortName = $parts[count($parts) - 1];
        $controllerName = lcfirst(str_replace('Controller', '', $classShortName));
        $viewPath = $this->templatesDir . '/' . $controllerName . '/' . $action;
        return $viewPath;*/
    }

    /**
     * @param string $ModelClass
     * @param array $input
     * @param int $id
     * @param array $saveOptions
     * @param \Closure|null $afterEdit
     * @return JsonResponse
     */
    public function editModel($ModelClass, $input, $id, $saveOptions = [], $afterEdit = null)
    {
        /**
         * @var ExtendedModel $model
         */
        $model = $ModelClass::find($id);
        if (!$model) {
            return response()->json('Model was not found', 404);
        }

        if (empty($input)) {
            return response()->json('Empty data input', 400);
        }

        $data = $input;
        if (!empty($input['data'])) {
            $data = $input['data'];
        }

        $model->loadInput($data);

        $saveResult = $model->save($saveOptions);
        if ($saveResult !== true) {
            return response()->json($saveResult ? $saveResult : 'Model not saved', 500);
        }

        foreach ($model->getRelations() as $key => $value) {
            $model->load($key);
        }

        if (!is_null($afterEdit)) {
            $afterEdit($model);
        }

        $fields = !empty($input['fields']) ? $input['fields'] : array_keys($data);

        return response()->json($model->fieldsToArray($fields));
    }

    /**
     * @param string        $ModelClass
     * @param array         $input
     * @param \Closure|null $afterCreate
     * @param array         $saveOptions
     * @return JsonResponse
     */
    public function createModel($ModelClass, $input, $afterCreate = null, $saveOptions = [])
    {
        $model = new $ModelClass();

        if (!isset($input['data'])) {
            return response()->json('Empty data input', 400);
        }

        $model->loadInput($input['data']);

        $saveResult = $model->save($saveOptions);
        if ($saveResult !== true) {
            return response()->json($saveResult ? $saveResult : 'Error. Model of type ' . $ModelClass . ' was not created', 500);
        }

        if (!is_null($afterCreate)) {
            $afterCreate($model);
        }

        return response()->json($model->asArray());
    }

    /**
     * @param string $ModelClass
     * @param array $input
     * @param \Closure|null $beforeDelete
     * @param \Closure|null $afterDelete
     * @return JsonResponse
     */
    public function deleteModels($ModelClass, $input, $beforeDelete = null, $afterDelete = null)
    {
        if (!isset($input['ids'])) {
            return response()->json('No models selected for deletion', 400);
        }

        $ids = $input['ids'];

        // checking all models if callback is supplied
        $models = $ModelClass::whereIn('id', $ids)->get();
        foreach ($models as $model) {
            if (!is_null($beforeDelete)) {
                $result = $beforeDelete($model);
                if ($result !== true) {
                    return response()->json($result, 400);
                }
            }
        }

        // if all is ok, deleting them
        $ModelClass::whereIn('id', $ids)->delete();


        if (!is_null($afterDelete)) {
            $reason = !empty($input['reason']) ? $input['reason'] : '';

            $afterDelete($ids, $reason);
        }

        return response()->json('', 204);
    }
}
