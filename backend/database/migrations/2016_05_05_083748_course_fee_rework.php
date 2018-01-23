<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\Course;
use App\Models\CourseClass;

class CourseFeeRework extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_course', 'is_full_time')) {
            Schema::table('t_course', function (Blueprint $table) {
                $table->boolean('is_full_time')->default(false);
            });
        }

        if (
            !Schema::hasColumn('t_course', 'fee_for_employed') &&
            !Schema::hasColumn('t_course', 'fee_for_unemployed')
        ) {
            Schema::table('t_course', function (Blueprint $table) {
                $table->decimal('fee_for_employed', 7, 2)->default(0);
                $table->decimal('fee_for_unemployed', 7, 2)->default(0);
            });
        }

        foreach (Course::all() as $course) {
            $courseClass = $course->courseClasses()->first();
            if (!$courseClass) {
                continue;
            }

            $course->feeForEmployed = $courseClass->courseClassFee;
            $course->feeForUnemployed = $courseClass->courseClassFeeUnemployed;
            $course->save();
        }

        Schema::table('t_course_class', function (Blueprint $table) {
            $table->dropColumn(['course_class_fee', 'course_class_fee_unemployed']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (
            !Schema::hasColumn('t_course_class', 'course_class_fee') &&
            !Schema::hasColumn('t_course_class', 'course_class_fee_unemployed')
        ) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->decimal('course_class_fee', 7, 2)->default(0);
                $table->decimal('course_class_fee_unemployed', 7, 2)->default(0);
            });
        }

        foreach (CourseClass::with('course')->get() as $courseClass) {
            $courseClass->courseClassFee = $courseClass->course->feeForEmployed;
            $courseClass->courseClassFeeUnemployed = $courseClass->course->feeForUnemployed;
            $courseClass->save();
        }

        Schema::table('t_course', function (Blueprint $table) {
            $table->dropColumn(['fee_for_employed', 'fee_for_unemployed']);
        });

        if (Schema::hasColumn('t_course', 'is_full_time')) {
            Schema::table('t_course', function (Blueprint $table) {
                $table->dropColumn('is_full_time');
            });
        }
    }
}
