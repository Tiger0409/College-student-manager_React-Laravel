<?php

namespace App\Classes\Helpers;

use Illuminate\Database\Eloquent\Model;
use App\Models\ExtendedModel;

class DataFormatter
{
    /**
     * @param Model[] $models
     * @param string[] $relations
     * @param bool $withRelations
     * @param bool $recursive
     * @return array
     */
    public static function modelsToArrays($models, $relations = null, $withRelations = false, $recursive = false)
    {
        $result = [];
        foreach ($models as $model) {
            if (!($model instanceof Model)) continue;

            if (method_exists($model, 'asArray')) {
                $result[] = $model->asArray($relations, $withRelations, $recursive);
                continue;
            }
            if (method_exists($model, 'toArray')) {
                $result[] = $model->toArray();
                continue;
            }
        }

        return ArrayHelper::underscoreKeysToCamelCase($result, true);
    }

    /**
     * @param ExtendedModel[] $models
     * @param string[] $fields
     * @return array[]
     */
    public static function modelsFieldsToArray($models, $fields)
    {
        $result = [];
        foreach ($models as $model) {
            $result[] = $model->fieldsToArray($fields);
        }
        return $result;
    }

    /**
     * value from second arg will be putted at the end of obj
     * @param string[] $pathParts
     * @param mixed $value
     * @return array
     */
    public static function createObjByPath($pathParts, $value = [])
    {
        if (count($pathParts) > 0) {
            $result[array_shift($pathParts)] = self::createObjByPath($pathParts, $value);
            return $result;
        } else {
            return $value;
        }
    }

    public static function printModels($models, $params = null)
    {
        if (isset($params['fields']))
            $models = DataFormatter::modelsFieldsToArray($models, $params['fields']);
        else
            $models = DataFormatter::modelsToArrays($models);
        return $models;
    }

    public static function formatQueryResult($query, $params = [], $toJson = true)
    {
        $paginated = QueryHelper::paginate($query, $params);
        $result = [
            'rows' => $paginated['items'],
            'info' => ['totalCount' => $paginated['count']]
        ];

        $result['rows'] = DataFormatter::printModels($result['rows'], $params);
        if ($toJson)
            return response()->json($result);
        return $result;
    }

    public static function formatQueryResultWithStats($query, $params = [], $statResults = [], $toJson = true)
    {
        $result = self::formatQueryResult($query, $params, false);
        $result['stats'] = $statResults;

        if ($toJson)
            return response()->json($result);
        return $result;
    }

    /**
     * @param ExtendedModel $model
     * @param array $params
     * @return \Illuminate\Http\JsonResponse
     */
    public static function formatSingleModel($model, $params = [])
    {
        if ($model) {
            if (isset($params['fields']))
                return response()->json($model->fieldsToArray($params['fields']));
            else
                return response()->json('Fields was not set', 405);
        }

        return response()->json('Model not found', 404);
    }

    /**
     * @param $values
     * @param bool|true $toJson
     * @return \Illuminate\Http\JsonResponse|null
     */
    public static function formatEnumValues($values, $toJson = true)
    {
        if (!is_array($values)) return null;

        if (isset($values)) {
            $result = [];
            foreach ($values as $value)
                $result[] = [
                    'value' => $value,
                    'label' => ucfirst(str_replace('_', ' ', $value))
                ];

            if ($toJson)
                return response()->json($result);
        }

        return null;
    }
}
