<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePayNameTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable("t_pay_name")){
            Schema::create('t_pay_name', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->string('description');
                $table->integer('branch_id');
                $table->integer('selected_term');
                $table->time('default_time_in');
                $table->time('default_time_out');
                $table->integer('user_id');
                $table->time('user_default_time_in');
                $table->time('user_default_time_out');
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
        Schema::drop('t_pay_name');
    }
}
