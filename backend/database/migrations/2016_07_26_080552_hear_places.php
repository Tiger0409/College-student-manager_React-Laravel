<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class HearPlaces extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('hear_places')) {
            return;
        }

        Schema::create('hear_places', function (Blueprint $table) {
            $table->increments('id');
            $table->string('place_name');
        });

        if (!Schema::hasColumn('t_user', 'hear_place_id')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->integer('hear_place_id')->nullable();
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
        if (Schema::hasTable('hear_places')) {
            Schema::drop('hear_places');
            return;
        }

        if (Schema::hasColumn('t_user', 'hear_place_id')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->dropColumn('hear_place_id');
            });
        }
    }
}
