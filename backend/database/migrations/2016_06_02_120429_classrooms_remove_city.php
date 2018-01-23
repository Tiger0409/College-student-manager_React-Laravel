<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClassroomsRemoveCity extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasColumn('classrooms', 'city_id')) {
            Schema::table('classrooms', function (Blueprint $table) {
                $table->dropColumn('city_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasColumn('classrooms', 'city_id')) {
            Schema::table('classrooms', function (Blueprint $table) {
                $table->bigInteger('city_id');
            });
        }
    }
}
