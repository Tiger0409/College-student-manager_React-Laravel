<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ListedInClosest extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_branches_associated', function (Blueprint $table) {
            $table->boolean('is_listed')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('t_branches_associated', function (Blueprint $table) {
            $table->dropColumn('is_listed');
        });
    }
}
