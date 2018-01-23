<?php

namespace App\Classes\Helpers;

class StringHelper
{
    public static function startsWith($str, $subStr)
    {
        return strpos($str, $subStr) === 0;
    }

    public static function endsWith($str, $subStr)
    {
        return strrpos($str, $subStr) === strlen($str) - strlen($subStr);
    }

    public static function camelCaseToUnderscore($str)
    {
        return preg_replace_callback('/([A-Z])/', function ($match) {
            return '_' . strtolower($match[0]);
        }, $str);
    }

    public static function underscoreToCamelCase($str)
    {
        return preg_replace_callback('/(_[a-z])/', function ($match) {
            return strtoupper(ltrim($match[0], '_'));
        }, $str);
    }
}