<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;

class DeptWebsiteRemove extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        MigrationHelper::dropColumns('t_dept', ['website_id', 'city_id']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasColumn('t_dept', 'website_id')) {
            Schema::table('t_dept', function (Blueprint $table) {
                $table->integer('website_id');
            });
        }

        if (!Schema::hasColumn('t_dept', 'city_id')) {
            Schema::table('t_dept', function (Blueprint $table) {
                $table->integer('city_id');
            });
        }
    }
}
