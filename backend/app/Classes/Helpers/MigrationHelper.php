<?php

namespace App\Classes\Helpers;

use App\Models\ExtendedModel;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class MigrationHelper
{
    /**
     * Because we can't modify values list of enum column.
     * @param ExtendedModel $ModelClass
     * @param string $columnName
     * @param string[] $desiredEnums
     * @param bool $moveValues
     */
    public static function changeEnumValues($ModelClass, $columnName, $desiredEnums, $moveValues = false)
    {
        $tableName = $ModelClass::tableName();
        $primaryKey = $ModelClass::getKeyNameStatic();

        if (!Schema::hasColumn($tableName, $columnName)) return;

        if ($moveValues) {
            $tempColumnName = 'temp_' . $columnName;

            // 1. create temp column with new enum values list
            if (!Schema::hasColumn($tableName, $tempColumnName)) {
                \Schema::table($tableName, function ($table) use ($desiredEnums, $tempColumnName) {
                    $table->enum($tempColumnName, $desiredEnums);
                });
            }

            // 2. copy all values from old column to it
            /*foreach ($ModelClass::all() as $row) {
                $row->$tempColumnName = $row->$columnName;
                $row->save();
            }*/

            DB::update("update $tableName set $tempColumnName = $columnName");

            // 3. drop old column in order to free original name
            // (because renaming is not supported for enum columns)
            Schema::table($tableName, function ($table) use ($columnName) {
                $table->dropColumn($columnName);
            });

            // 4. create new column with new enum values list and original name
            Schema::table($tableName, function ($table) use ($columnName, $desiredEnums) {
                $table->enum($columnName, $desiredEnums)->default($desiredEnums[0]);
            });

            // 5. copy values to this column from our temp column
            /*foreach ($ModelClass::all() as $row) {
                $row->$columnName = $row->$tempColumnName;
                $row->save();
            }*/
            DB::update("update $tableName set $columnName = $tempColumnName");

            // 6. remove temp column
            if (Schema::hasColumn($tableName, $tempColumnName)) {
                Schema::table($tableName, function ($table) use ($columnName) {
                    $table->dropColumn('temp_' . $columnName);
                });
            }
        } else {
            if (Schema::hasColumn($tableName, $columnName)) {
                Schema::table($tableName, function (Blueprint $table) use ($columnName) {
                    $table->dropColumn($columnName);
                });
            }

            Schema::table($tableName, function (Blueprint $table) use ($columnName, $desiredEnums) {
                $table->enum($columnName, $desiredEnums);
            });
        }
    }

    /**
     * @param string $table
     * @param array|string $columns
     */
    public static function dropColumns($table, $columns)
    {
        $drop = function ($table, $column) {
            if (!Schema::hasColumn($table, $column)) return;

            Schema::table($table, function (BluePrint $table) use ($column) {
                $table->dropColumn($column);
            });
        };

        if (is_string($columns)) {
            $drop($table, $columns);
            return;
        }

        foreach ($columns as $column) {
            $drop($table, $column);
        }
    }
}