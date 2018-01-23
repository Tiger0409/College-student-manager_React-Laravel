<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Complaints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->enum('type', [
                'premises',
                'customer service',
                'teaching/teachers',
                'bullying',
                'Health &amp',
                'Safety/fire/1st aid',
                'child safety',
                'curriculum',
                'other'
            ])->default('other');
            $table->text('text')->default('');
            $table->string('handler_fullname')->default('');
            $table->string('action_taken')->nullable();
            $table->timestamp('action_deadline')->nullable();
            $table->timestamp('completion_date')->nullable();
        });

        Schema::create('users_complaints', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('complaint_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('complaints');
        Schema::drop('users_complaints');
    }
}
