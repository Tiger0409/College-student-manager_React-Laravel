<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class StudentPaymentFloatAmount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->float('amount_temp');
        });

        DB::update('update t_student_payment set amount_temp = amount');

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->float('amount');
        });

        DB::update('update t_student_payment set amount = amount_temp');

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->dropColumn('amount_temp');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->integer('amount_temp');
        });

        DB::update('update t_student_payment set amount_temp = amount');

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->dropColumn('amount');
        });

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->integer('amount');
        });

        DB::update('update t_student_payment set amount = amount_temp');

        Schema::table('t_student_payment', function (Blueprint $table) {
            $table->dropColumn('amount_temp');
        });
    }
}
