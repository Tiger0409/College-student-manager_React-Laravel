<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePaynameUserTimeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable("t_payname_user_time")){
            Schema::create('t_payname_user_time', function (Blueprint $table) {
                $table->integer('pay_name_id');
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
        Schema::drop('t_payname_user_time');
    }
}
