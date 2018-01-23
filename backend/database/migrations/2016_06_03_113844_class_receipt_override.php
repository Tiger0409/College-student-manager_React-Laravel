<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClassReceiptOverride extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_course_class', function (BluePrint $table) {
            $table->string('receipt_email')->nullable();
            $table->string('receipt_email_subject')->nullable();
            $table->longText('receipt_template')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $this->dropColumn('t_course_class', 'receipt_email');
        $this->dropColumn('t_course_class', 'receipt_email_subject');
        $this->dropColumn('t_course_class', 'receipt_template');
    }

    public function dropColumn($table, $column)
    {
        if (Schema::hasColumn($table, $column)) {
            Schema::table($table, function (BluePrint $table) use ($column) {
                $table->dropColumn($column);
            });
        }
    }
}
