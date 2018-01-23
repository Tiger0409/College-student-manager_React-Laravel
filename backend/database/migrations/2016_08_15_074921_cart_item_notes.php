<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CartItemNotes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('cart_item', 'notes')) {
            Schema::table('cart_item', function (Blueprint $table) {
                $table->string('notes');
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
        if (Schema::hasColumn('cart_item', 'notes')) {
            Schema::dropColumn('cart_item', 'notes');
        }
    }
}
