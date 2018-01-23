<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CourseClassFeeOverride extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_course_class', 'fee_for_employed')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->decimal('fee_for_employed', 7, 2)->default(-1);
            });
        }

        if (!Schema::hasColumn('t_course_class', 'fee_for_unemployed')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->decimal('fee_for_unemployed', 7, 2)->default(-1);
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
        if (Schema::hasColumn('t_course_class', 'fee_for_employed')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->dropColumn('fee_for_employed');
            });
        }

        if (Schema::hasColumn('t_course_class', 'fee_for_unemployed')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->dropColumn('fee_for_unemployed');
            });
        }
    }
}
