<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class CartOrigStatus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cart_item', function (Blueprint $table) {
            $table->string('original_student_status')->nullable();
        });

        DB::update('update cart_item set original_student_status = student_status');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cart_item', function (Blueprint $table) {
            $table->dropColumn('original_student_status');
        });
    }
}
