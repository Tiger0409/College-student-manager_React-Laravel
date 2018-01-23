<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTimeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable("t_payname_time")){
            Schema::create('t_payname_time', function (Blueprint $table) {
                $table->increments('id');
                $table->integer('week_day_id');
                $table->integer('pay_name_id');
                $table->time('time_in');
                $table->string('late_count');
                $table->string('late_time');
                $table->time('time_out');
                $table->string('total_hours');
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
        Schema::drop('t_payname_time');
    }
}
