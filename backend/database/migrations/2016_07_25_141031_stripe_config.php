<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StripeConfig extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_user', function ($table) {
            if (!Schema::hasColumn('t_user', 'stripe_id')) {
                $table->string('stripe_id')->nullable();
            }

            if (!Schema::hasColumn('t_user', 'card_brand')) {
                $table->string('card_brand')->nullable();
            }

            if (!Schema::hasColumn('t_user', 'card_last_four')) {
                $table->string('card_last_four')->nullable();
            }

            if (!Schema::hasColumn('t_user', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable();
            }
        });

        Schema::create('subscriptions', function ($table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->string('name');
            $table->string('stripe_id');
            $table->string('stripe_plan');
            $table->integer('quantity');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
