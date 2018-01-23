<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StripeBindWithDonations extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('stripe_transactions', 'donation_record_id')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
                $table->integer('donation_record_id')->nullable();
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
        if (Schema::hasColumn('stripe_transactions', 'donation_record_id')) {
            Schema::table('stripe_transactions', function (Blueprint $table) {
                $table->dropColumn('donation_record_id');
            });
        }
    }
}
