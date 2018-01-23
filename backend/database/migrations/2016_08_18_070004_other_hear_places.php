<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class OtherHearPlaces extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasColumn('hear_places', 'is_visible')) return;

        Schema::table('hear_places', function (Blueprint $table) {
           if ($table->boolean('is_visible')->default(true));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasColumn('hear_places', 'is_visible')) return;

        Schema::table('hear_places', function (Blueprint $table) {
            if ($table->dropColumn('is_visible'));
        });
    }
}
