<?php

namespace App\Classes\Helpers;

use Illuminate\Database\Eloquent\Collection;

class ArrayHelper
{
    public static function isAssociative($array)
    {
        return is_array($array) && array_keys($array) !== range(0, count($array) - 1);
    }

    public static function underscoreKeysToCamelCase($array, $recursive = false) {
        if (!is_array($array)) {
            return $array;
        }

        $keys = array_keys($array);
        foreach ($keys as $key) {
            $value = $array[$key];

            if ($recursive && (is_array($value) || $value instanceof Collection)) {
                if ($value instanceof Collection) {
                    $value = $value->toArray();
                }

                $value = ArrayHelper::underscoreKeysToCamelCase($value, true);
            }

            $newKey = StringHelper::underscoreToCamelCase($key);
            $array[$newKey] = $value;
            if ($newKey != $key) {
                unset($array[$key]);
            }
        }

        return $array;
    }

    public static function camelCaseKeysToUnderscore($array) {
        if (!is_array($array)) {
            return $array;
        }

        $keys = array_keys($array);
        foreach ($keys as $key) {
            $value = $array[$key];
            $array[StringHelper::camelCaseToUnderscore($key)] = $value;
            unset($array[$key]);
        }

        return $array;
    }
}