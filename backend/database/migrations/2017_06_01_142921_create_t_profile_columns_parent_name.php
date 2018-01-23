<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTProfileColumnsParentName extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_profile', function (Blueprint $table) {
            if (!Schema::hasColumn('t_profile', 'parent_name')) {
                $table->string('parent_name')->nullable();
            }
            if (!Schema::hasColumn('t_profile', 'school')) {
                $table->string('school')->nullable();
            }
            if (!Schema::hasColumn('t_profile', 'complete')) {
                $table->string('complete')->nullable()->default('no');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('t_profile', function (Blueprint $table) {
            if (!Schema::hasColumn('t_profile', 'parent_name')) {
                $table->dropColumn('parent_name');
            }
            if (!Schema::hasColumn('t_profile', 'school')) {
                $table->dropColumn('school');
            }
            if (!Schema::hasColumn('t_profile', 'complete')) {
                $table->dropColumn('complete');
            }
        });
    }
}
