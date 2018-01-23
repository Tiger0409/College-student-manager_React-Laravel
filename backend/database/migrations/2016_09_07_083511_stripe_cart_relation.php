<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StripeCartRelation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('stripe_transactions', 'cart_id')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
                $table->integer('cart_id')->nullable();
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
        if (Schema::hasColumn('stripe_transactions', 'cart_id')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
               $table->dropColumn('cart_id');
            });
        }
    }
}
