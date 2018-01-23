<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BranchesTermsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('t_branches_assoc_terms')) {
            Schema::create('t_branches_assoc_terms', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->increments('id');
                $table->integer('branch_associated_id')->unsigned();
                $table->integer('term_id')->unsigned();
            });
        }

        /*Schema::table('t_branches_assoc_terms', function (Blueprint $table) {
            $table->foreign('branch_associated_id')->references('id')->on('t_branches_associated');
            $table->foreign('term_id')->references('id')->on('t_term');
        });*/
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('t_branches_assoc_terms')) {
            Schema::drop('t_branches_assoc_terms');
        }
    }
}
