<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StripeCardOwnerName extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('stripe_transactions', 'card_owner_name')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
               $table->string('card_owner_name')->nullable();
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
        if (Schema::hasColumn('stripe_transactions', 'card_owner_name')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
                $table->dropColumn('card_owner_name');
            });
        }
    }
}
