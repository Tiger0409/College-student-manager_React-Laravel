<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\CourseClass;
use App\Models\GeneralSetting;
use App\Models\Term;

class ModifyTerms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        if (!Schema::hasColumn('t_course_class', 'course_class_term_id')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->integer('course_class_term_id');
            });
        }

        foreach (CourseClass::all() as $courseClass) {
            $termNumber = str_replace('term ', '', $courseClass->courseClassTerm);
            $term = Term::where([
                    'term' => $termNumber,
                    'year' => $courseClass->courseClassYear]
            )->first();

            if ($term) {
                $courseClass->courseClassTermId = $term->id;
                $courseClass->save();
            }
        }

        Schema::table(CourseClass::tableName(), function($table) {
            $table->dropColumn(['course_class_term', 'course_class_year']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table(CourseClass::tableName(), function($table) {
            $table->string('course_class_year', 4);
            $table->enum('course_class_term', ['term 1', 'term 2', 'term 3', 'term 4']);
        });

        foreach (CourseClass::all() as $courseClass) {
            $term = $courseClass->term;
            if ($term) {
                $courseClass->courseClassTerm = $term->term;
                $courseClass->courseClassYear = $term->year;
                $courseClass->save();
            } else {
                echo 'false';
            }
        }

        Schema::table(CourseClass::tableName(), function($table) {
            $table->dropColumn('course_class_term_id');
        });
    }
}
