<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StripeTransactions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stripe_transactions', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->datetime('created');
            $table->string('status');
            $table->float('amount')->nullable();
            $table->string('balance_transaction')->nullable();
            $table->string('currency')->nullable();
            $table->string('customer')->nullable();
            $table->string('description')->nullable();
            $table->longText('full_details');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stripe_transactions');
    }
}
