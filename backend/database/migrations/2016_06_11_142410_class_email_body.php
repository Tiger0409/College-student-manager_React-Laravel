<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClassEmailBody extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasColumn('t_course_class', 'receipt_email')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->dropColumn(['receipt_email']);
            });
        }

        Schema::table('t_course_class', function (Blueprint $table) {
            $table->longText('receipt_email_body');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('t_course_class', 'receipt_email_body')) {
            Schema::table('t_course_class', function (Blueprint $table) {
                $table->dropColumn(['receipt_email_body']);
            });
        }

        Schema::table('t_course_class', function (Blueprint $table) {
            $table->string('receipt_email');
        });
    }
}
