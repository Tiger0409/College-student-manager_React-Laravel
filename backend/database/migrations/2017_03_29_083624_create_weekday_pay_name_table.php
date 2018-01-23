<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeekdayPayNameTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable("weekday_payname")){
            Schema::create('weekday_payname', function (Blueprint $table) {
                $table->increments('id');
                $table->integer('week_id');
                $table->integer('pay_name_id');
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
        Schema::drop('weekday_payname');
    }
}
