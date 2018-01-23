<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;

class TermFullPartDescription extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        MigrationHelper::dropColumns('t_term', 'description');

        if (!Schema::hasColumn('t_term', 'part_time_description')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->longText('part_time_description');
            });
        }

        if (!Schema::hasColumn('t_term', 'full_time_description')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->longText('full_time_description');
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
        MigrationHelper::dropColumns('t_term', ['part_time_description', 'full_time_']);

        if (!Schema::hasColumn('t_term', 'description')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->longText('description');
            });
        }
    }
}
